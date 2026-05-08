import { Router, type Request, type Response } from "express";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { airdrop } from "../airdrop.js";
import { createUser, getUser } from "../db.js";

const router = Router();

// 초기 에어드랍: quest-2(0.01) + quest-3(0.01) + 여유 = 0.03 TONE
const INITIAL_AIRDROP = BigInt("30000000000000000");

// POST /v1/register
router.post("/", async (_req: Request, res: Response) => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const walletAddress = account.address;

  if (getUser(walletAddress)) {
    res.status(409).json({ error: "이미 등록된 주소입니다" });
    return;
  }

  let airdropTx: string | undefined;
  try {
    airdropTx = await airdrop(walletAddress, INITIAL_AIRDROP);
  } catch (e) {
    console.error("초기 에어드랍 실패:", String(e));
  }

  createUser({
    walletAddress,
    privateKey,
    registeredAt: new Date().toISOString(),
    initialAirdropTx: airdropTx,
  });

  res.json({
    walletAddress,
    privateKey,
    network: `eip155:${process.env.CHAIN_ID || "402"}`,
    initialAirdrop: `${Number(INITIAL_AIRDROP) / 1e18} TONE`,
    airdropTx,
    hint: "이 privateKey로 X-PAYMENT 서명을 생성하세요. 안전한 곳에 보관하세요.",
  });
});

export default router;
