export type QuestType =
  | 'drag-drop'
  | 'theory-ox'
  | 'theory-mc'
  | 'snowman-sabotage'
  | 'staff-code'
  | 'feedback'
  | 'threejs'
  | 'interests';

export interface QuestQuestion {
  question: string;
  choices: string[];
  answerIndex: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  price: bigint;
  questType: QuestType;
  // theory quests: OX has 2 questions, MC has 1
  theory?: string;
  questions?: QuestQuestion[];
  // staff-code quest
  staffCode?: string;
  // threejs quest
  webCode?: string;
}

export interface PaymentRequirements {
  scheme: "exact";
  network: string;
  asset: string;
  amount: string;
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
