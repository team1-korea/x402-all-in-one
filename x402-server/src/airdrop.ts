import {
  createWalletClient,
  defineChain,
  http,
  type Hex,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";

const apixTestnet = defineChain({
  id: Number(process.env.CHAIN_ID || "402"),
  name: "Avalanche APIX L1 Testnet",
  nativeCurrency: { name: "APIX", symbol: "APIX", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_URL || "https://subnets.avax.network/apix/testnet/rpc"] },
  },
});

function getWalletClient() {
  const mnemonic = process.env.AIRDROP_MNEMONIC;
  if (!mnemonic) throw new Error("AIRDROP_MNEMONIC not set");

  const account = mnemonicToAccount(mnemonic);
  return createWalletClient({ account, chain: apixTestnet, transport: http() });
}

export async function airdrop(to: string, amount: bigint): Promise<string> {
  const client = getWalletClient();
  const txHash = await client.sendTransaction({
    to: to as Hex,
    value: amount,
  });
  return txHash;
}
