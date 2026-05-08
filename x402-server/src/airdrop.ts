import {
  createWalletClient,
  createPublicClient,
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

const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

function getWalletClient() {
  const mnemonic = process.env.AIRDROP_MNEMONIC;
  if (!mnemonic) throw new Error("AIRDROP_MNEMONIC not set");
  const account = mnemonicToAccount(mnemonic);
  return createWalletClient({ account, chain: apixTestnet, transport: http() });
}

export async function airdrop(to: string, amount: bigint): Promise<string> {
  const tokenAddress = process.env.TONE_TOKEN as Hex | undefined;
  if (!tokenAddress) throw new Error("TONE_TOKEN not set");

  const client = getWalletClient();
  const txHash = await client.writeContract({
    address: tokenAddress,
    abi: ERC20_TRANSFER_ABI,
    functionName: "transfer",
    args: [to as Hex, amount],
  });
  return txHash;
}
