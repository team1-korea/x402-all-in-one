export interface Quest {
  id: string;
  name: string;
  description: string;
  price: bigint; // wei (0 = 무료)
  question: string;
  choices: string[];
  answerIndex: number; // 0-based
  reward: bigint; // 정답 시 에어드랍 금액 (wei)
}

export interface PaymentRequirements {
  scheme: "exact";
  network: string;
  asset: "native";
  amount: string; // wei string
  payTo: string;
  maxTimeoutSeconds: number;
  resource: string;
  description: string;
  mimeType: string;
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
