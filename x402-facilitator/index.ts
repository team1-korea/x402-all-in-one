import { x402Facilitator } from "@x402/core/facilitator";
import {
  validatePaymentPayload,
  validatePaymentRequirements,
} from "@x402/core/schemas";
import type {
  Network,
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
} from "@x402/core/types";
import { toFacilitatorEvmSigner } from "@x402/evm";
import { ExactEvmScheme } from "@x402/evm/exact/facilitator";
import dotenv from "dotenv";
import express from "express";
import {
  createWalletClient,
  defineChain,
  http,
  publicActions,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config();

type InvalidRequestReason =
  | "invalid_payload"
  | "invalid_payment_requirements"
  | "invalid_x402_version";

type ParsedFacilitatorRequest =
  | {
      ok: true;
      paymentPayload: PaymentPayload;
      paymentRequirements: PaymentRequirements;
    }
  | {
      ok: false;
      invalidReason: InvalidRequestReason;
      invalidMessage: string;
    };

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} environment variable is required`);
    process.exit(1);
  }
  return value;
}

const port = Number(process.env.PORT || "4022");
const chainId = Number(requiredEnv("EVM_CHAIN_ID"));
const rpcUrl = requiredEnv("EVM_RPC_URL");
const privateKey = requiredEnv("EVM_PRIVATE_KEY") as Hex;
const network = `eip155:${chainId}` as Network;

if (!Number.isSafeInteger(chainId) || chainId <= 0) {
  console.error("EVM_CHAIN_ID must be a positive integer");
  process.exit(1);
}

const account = privateKeyToAccount(privateKey);
const chain = defineChain({
  id: chainId,
  name: process.env.EVM_CHAIN_NAME || `Avalanche L1 ${chainId}`,
  nativeCurrency: {
    name: process.env.EVM_NATIVE_NAME || "AVAX",
    symbol: process.env.EVM_NATIVE_SYMBOL || "AVAX",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
});

const viemClient = createWalletClient({
  account,
  chain,
  transport: http(rpcUrl),
}).extend(publicActions);

const evmSigner = toFacilitatorEvmSigner({
  address: account.address,
  getCode: (args: { address: Hex }) => viemClient.getCode(args),
  readContract: (args: {
    address: Hex;
    abi: readonly unknown[];
    functionName: string;
    args?: readonly unknown[];
  }) =>
    viemClient.readContract({
      ...args,
      args: args.args || [],
    }),
  verifyTypedData: (args: {
    address: Hex;
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
    signature: Hex;
  }) => viemClient.verifyTypedData(args as any),
  writeContract: (args: {
    address: Hex;
    abi: readonly unknown[];
    functionName: string;
    args: readonly unknown[];
    gas?: bigint;
  }) =>
    viemClient.writeContract({
      ...args,
      args: args.args || [],
      gas: args.gas,
    }),
  sendTransaction: (args: { to: Hex; data: Hex }) =>
    viemClient.sendTransaction(args),
  waitForTransactionReceipt: (args: { hash: Hex }) =>
    viemClient.waitForTransactionReceipt(args),
});

const facilitator = new x402Facilitator()
  .register(
    network,
    new ExactEvmScheme(evmSigner, {
      deployERC4337WithEIP6492:
        process.env.DEPLOY_ERC4337_WITH_EIP6492 === "true",
      simulateInSettle: process.env.SIMULATE_IN_SETTLE === "true",
    }),
  )
  .onAfterVerify(async (context) => {
    if (context.result.isValid) {
      console.log(`verified payment from ${context.result.payer}`);
    }
  })
  .onAfterSettle(async (context) => {
    if (context.result.success) {
      console.log(`settled payment ${context.result.transaction}`);
    }
  })
  .onSettleFailure(async (context) => {
    console.error(`settlement failed: ${context.error.message}`);
  });

const app = express();
app.use(express.json({ limit: "1mb" }));

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requestNetwork(body: unknown): Network {
  if (!isObject(body)) {
    return network;
  }

  const paymentPayload = body.paymentPayload;
  if (isObject(paymentPayload)) {
    const accepted = paymentPayload.accepted;
    if (isObject(accepted) && typeof accepted.network === "string") {
      return accepted.network as Network;
    }
  }

  const paymentRequirements = body.paymentRequirements;
  if (
    isObject(paymentRequirements) &&
    typeof paymentRequirements.network === "string"
  ) {
    return paymentRequirements.network as Network;
  }

  return network;
}

function parseFacilitatorRequest(body: unknown): ParsedFacilitatorRequest {
  if (!isObject(body)) {
    return {
      ok: false,
      invalidReason: "invalid_payload",
      invalidMessage: "Request body must be a JSON object",
    };
  }

  if (body.x402Version !== 2) {
    return {
      ok: false,
      invalidReason: "invalid_x402_version",
      invalidMessage: "Facilitator request must include x402Version: 2",
    };
  }

  let paymentPayload: PaymentPayload;
  try {
    const parsedPayload = validatePaymentPayload(body.paymentPayload);
    if (parsedPayload.x402Version !== 2) {
      return {
        ok: false,
        invalidReason: "invalid_x402_version",
        invalidMessage: "PaymentPayload must use x402Version: 2",
      };
    }
    paymentPayload = parsedPayload as PaymentPayload;
  } catch (error) {
    return {
      ok: false,
      invalidReason: "invalid_payload",
      invalidMessage: errorMessage(error),
    };
  }

  let paymentRequirements: PaymentRequirements;
  try {
    const parsedRequirements = validatePaymentRequirements(
      body.paymentRequirements,
    );
    if (!("amount" in parsedRequirements)) {
      return {
        ok: false,
        invalidReason: "invalid_payment_requirements",
        invalidMessage:
          "PaymentRequirements must use the x402 v2 shape with amount",
      };
    }
    paymentRequirements = parsedRequirements as PaymentRequirements;
  } catch (error) {
    return {
      ok: false,
      invalidReason: "invalid_payment_requirements",
      invalidMessage: errorMessage(error),
    };
  }

  return {
    ok: true,
    paymentPayload,
    paymentRequirements,
  };
}

app.post("/verify", async (req, res) => {
  try {
    const request = parseFacilitatorRequest(req.body);
    if (!request.ok) {
      return res.status(400).json({
        isValid: false,
        invalidReason: request.invalidReason,
        invalidMessage: request.invalidMessage,
      });
    }

    const response: VerifyResponse = await facilitator.verify(
      request.paymentPayload,
      request.paymentRequirements,
    );
    return res.json(response);
  } catch (error) {
    console.error("verify error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/settle", async (req, res) => {
  try {
    const request = parseFacilitatorRequest(req.body);
    if (!request.ok) {
      return res.status(400).json({
        success: false,
        errorReason: request.invalidReason,
        errorMessage: request.invalidMessage,
        transaction: "",
        network: requestNetwork(req.body),
      });
    }

    const response: SettleResponse = await facilitator.settle(
      request.paymentPayload,
      request.paymentRequirements,
    );
    return res.json(response);
  } catch (error) {
    console.error("settle error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/supported", (_req, res) => {
  res.json(facilitator.getSupported());
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    network,
    chainId,
    rpcUrl,
    facilitatorAddress: account.address,
  });
});

app.listen(port, () => {
  console.log(`x402 facilitator listening on http://localhost:${port}`);
  console.log(`network: ${network}`);
  console.log(`facilitator address: ${account.address}`);
});
