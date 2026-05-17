#!/usr/bin/env node
/**
 * x402 E2E 테스트
 *
 * 실행: npx tsx scripts/e2e.ts [server-url]
 * 예)   npx tsx scripts/e2e.ts http://localhost:4010
 *
 * 커버 흐름:
 *  1. POST /v1/register          → 지갑 생성 + 100 USDC 에어드랍
 *  2. GET /v1/quest/product-a    → 퀘스트 목록 확인
 *  3. GET /v1/quest/.../2        → 402 응답 + accepts 파싱
 *  4. EIP-3009 서명 생성 (viem)
 *  5. GET /v1/quest/.../2 + X-PAYMENT → questUrl + settleTx
 *  6. POST /v1/quest/.../2/answer     → 정답 제출
 */

import { createPublicClient, createWalletClient, defineChain, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { randomBytes } from "crypto";

const API_BASE = process.argv[2]?.replace(/\/$/, "") || "http://localhost:4010";
const PRODUCT = "product-a";
const TEST_STEP = "2"; // theory-ox, answerIndex [0, 0]

const CHAIN_ID = 402;
const RPC_URL = "https://subnets.avax.network/apix/testnet/rpc";

const apixTestnet = defineChain({
  id: CHAIN_ID,
  name: "Avalanche APIX L1 Testnet",
  nativeCurrency: { name: "APIX", symbol: "APIX", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

// ─── helpers ───────────────────────────────────────────────────────────────

let stepNum = 0;

function banner(msg: string) {
  stepNum++;
  console.log(`\n[${stepNum}] ${msg}`);
}
function ok(msg: string) { console.log(`   ✅ ${msg}`); }
function info(msg: string) { console.log(`      ${msg}`); }
function fail(msg: string, detail?: unknown): never {
  console.error(`   ❌ ${msg}`);
  if (detail !== undefined) console.error("     ", JSON.stringify(detail, null, 2));
  process.exit(1);
}

async function getJson<T>(url: string, opts?: RequestInit): Promise<{ status: number; body: T }> {
  const res = await fetch(url, opts);
  const body = await res.json() as T;
  return { status: res.status, body };
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n━━━ x402 E2E ━━━`);
  console.log(`  server: ${API_BASE}`);

  // ── 1. register ────────────────────────────────────────────────────────
  banner("POST /v1/register");
  const { status: regStatus, body: reg } = await getJson<{
    walletAddress: string;
    privateKey: string;
    initialAirdrop: string;
    airdropTx?: string;
    network: string;
  }>(`${API_BASE}/v1/register`, { method: "POST" });

  if (regStatus !== 200) fail(`register HTTP ${regStatus}`, reg);
  ok(`wallet: ${reg.walletAddress}`);
  ok(`airdrop: ${reg.initialAirdrop}`);
  if (reg.airdropTx) info(`airdropTx: ${reg.airdropTx}`);

  // airdrop tx 컨펌 대기
  if (reg.airdropTx) {
    banner("에어드랍 tx 컨펌 대기");
    const publicClient = createPublicClient({ chain: apixTestnet, transport: http() });
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: reg.airdropTx as Hex,
        timeout: 30_000,
      });
      ok(`confirmed (block ${receipt.blockNumber}, status: ${receipt.status})`);
      if (receipt.status !== "success") fail("airdrop tx reverted");
    } catch (e) {
      fail("airdrop tx 컨펌 타임아웃 (30s)", String(e));
    }
  }

  // ── 2. list quests ─────────────────────────────────────────────────────
  banner(`GET /v1/quest/${PRODUCT}`);
  const { status: listStatus, body: quests } = await getJson<Array<{
    id: string; name: string; difficulty: string; questType: string;
  }>>(`${API_BASE}/v1/quest/${PRODUCT}`);

  if (listStatus !== 200) fail(`list HTTP ${listStatus}`, quests);
  ok(`${quests.length} quests`);
  for (const q of quests) info(`[${q.difficulty}] ${q.id}  ${q.name}`);

  // ── 3. 402 without payment ─────────────────────────────────────────────
  banner(`GET /v1/quest/${PRODUCT}/${TEST_STEP}  — expect 402`);
  const { status: s402, body: b402 } = await getJson<{
    x402Version: number;
    accepts: Array<{
      scheme: string; network: string; asset: string;
      amount: string; payTo: string; maxTimeoutSeconds: number;
      resource: string;
      extra: { assetTransferMethod: string; name: string; version: string };
    }>;
    error: string;
    difficulty: string;
  }>(`${API_BASE}/v1/quest/${PRODUCT}/${TEST_STEP}`);

  if (s402 !== 402) fail(`expected 402, got ${s402}`, b402);
  const req = b402.accepts[0];
  ok(`402 received — difficulty: ${b402.difficulty}`);
  info(`amount: ${req.amount}  payTo: ${req.payTo}`);
  info(`asset: ${req.asset}`);
  info(`token: ${req.extra.name} v${req.extra.version}`);

  // ── 4. EIP-3009 서명 ──────────────────────────────────────────────────
  banner("EIP-3009 서명 생성");
  const account = privateKeyToAccount(reg.privateKey as Hex);
  const walletClient = createWalletClient({ account, chain: apixTestnet, transport: http() });

  const now = BigInt(Math.floor(Date.now() / 1000));
  const nonce = `0x${randomBytes(32).toString("hex")}` as Hex;

  const authorization = {
    from: reg.walletAddress as Hex,
    to: req.payTo as Hex,
    value: BigInt(req.amount),
    validAfter: 0n,
    validBefore: now + BigInt(req.maxTimeoutSeconds),
    nonce,
  };

  const domain = {
    name: req.extra.name,
    version: req.extra.version,
    chainId: CHAIN_ID,
    verifyingContract: req.asset as Hex,
  };

  const signature = await walletClient.signTypedData({
    domain,
    types: {
      TransferWithAuthorization: [
        { name: "from",        type: "address" },
        { name: "to",          type: "address" },
        { name: "value",       type: "uint256" },
        { name: "validAfter",  type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce",       type: "bytes32" },
      ],
    },
    primaryType: "TransferWithAuthorization",
    message: authorization,
  });
  ok(`signature: ${signature.slice(0, 22)}…`);

  // ── 5. X-PAYMENT 헤더 조립 + 결제 ────────────────────────────────────
  banner(`GET /v1/quest/${PRODUCT}/${TEST_STEP}  — with X-PAYMENT`);
  const payloadObj = {
    x402Version: 2,
    accepted: req,
    payload: {
      signature,
      authorization: {
        from: authorization.from,
        to: authorization.to,
        value: authorization.value.toString(),
        validAfter: authorization.validAfter.toString(),
        validBefore: authorization.validBefore.toString(),
        nonce: authorization.nonce,
      },
    },
  };
  const xPayment = Buffer.from(JSON.stringify(payloadObj)).toString("base64");

  const { status: payStatus, body: payBody } = await getJson<{
    id: string; name: string; questType: string; difficulty: string;
    questUrl: string; hint: string; settleTx: string;
  }>(`${API_BASE}/v1/quest/${PRODUCT}/${TEST_STEP}`, {
    headers: { "X-PAYMENT": xPayment },
  });

  if (payStatus !== 200) fail(`payment HTTP ${payStatus}`, payBody);
  ok(`questUrl: ${payBody.questUrl}`);
  ok(`settleTx: ${payBody.settleTx}`);

  // ── 6. answer 제출 ────────────────────────────────────────────────────
  // quest-2 = theory-ox, 두 문제 모두 answerIndex: 0
  banner(`POST /v1/quest/${PRODUCT}/${TEST_STEP}/answer`);
  const { status: ansStatus, body: ansBody } = await getJson<{
    correct: boolean; message: string;
  }>(`${API_BASE}/v1/quest/${PRODUCT}/${TEST_STEP}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress: reg.walletAddress, answers: [0, 0] }),
  });

  if (ansStatus !== 200) fail(`answer HTTP ${ansStatus}`, ansBody);
  if (!ansBody.correct) fail("오답", ansBody);
  ok(ansBody.message);

  // ── done ──────────────────────────────────────────────────────────────
  console.log(`\n━━━ E2E 완료 ✅ ━━━\n`);
}

main().catch((err) => {
  console.error("\n❌ unexpected error:", err);
  process.exit(1);
});
