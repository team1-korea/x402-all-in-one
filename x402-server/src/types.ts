export interface Quest {
  id: string;
  name: string;
  description: string;
  price: bigint; // wei (0 = 무료)
  question: string;
  choices: string[];
  answerIndex: number; // 0-based
  reward: bigint; // 정답 시 에어드랍 금액 (wei)
  secretCode?: string; // 웹 연동형 정답 비밀코드 (선택 사항)
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
