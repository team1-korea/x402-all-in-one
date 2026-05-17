import { Router, type Request, type Response } from "express";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { airdrop } from "../airdrop.js";
import { createUser, getUser } from "../db.js";

const router = Router();

// 100 USDC (6 decimals) = 10 quests × 10 USDC
const INITIAL_AIRDROP = BigInt(100 * 1_000_000);

// POST /v1/register
router.post("/", async (_req: Request, res: Response) => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const walletAddress = account.address;

  if (await getUser(walletAddress)) {
    res.status(409).json({ error: "이미 등록된 주소입니다" });
    return;
  }

  let airdropTx: string | undefined;
  try {
    airdropTx = await airdrop(walletAddress, INITIAL_AIRDROP);
  } catch (e) {
    console.error("초기 에어드랍 실패:", String(e));
  }

  await createUser({
    walletAddress,
    privateKey,
    registeredAt: new Date().toISOString(),
    initialAirdropTx: airdropTx,
  });

  res.json({
    walletAddress,
    privateKey,
    network: `eip155:${process.env.CHAIN_ID || "402"}`,
    initialAirdrop: "100 USDC",
    airdropTx,
    hint: "이 privateKey로 X-PAYMENT 서명을 생성하세요. 안전한 곳에 보관하세요.",
  });
});

export default router;
