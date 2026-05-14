export interface Quest {
  id: string;
  name: string;
  description: string;
  price: bigint;
  question: string;
  choices: string[];
  answerIndex: number;
  isWebQuest?: boolean;
}

export interface PaymentRequirements {
  scheme: "exact";
  network: string;
  asset: string; // ERC-20 token contract address
  amount: string; // wei string
  payTo: string;
  maxTimeoutSeconds: number;
  resource: string;
  description: string;
  mimeType: string;
  extra?: {
    assetTransferMethod: "eip3009" | "permit2";
    name: string;
    version: string;
  };
}

export interface X402Response {
  x402Version: number;
  accepts: PaymentRequirements[];
  error: string;
}

export interface FacilitatorVerifyRequest {
  x402Version: number;
  paymentPayload: unknown;
  paymentRequirements: unknown;
}

export interface FacilitatorVerifyResponse {
  isValid: boolean;
  invalidReason?: string;
  invalidMessage?: string;
  payer?: string;
}

export interface FacilitatorSettleResponse {
  success: boolean;
  transaction: string;
  network: string;
  payer?: string;
  errorReason?: string;
  errorMessage?: string;
}
