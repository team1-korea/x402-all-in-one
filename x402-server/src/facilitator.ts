import type {
  FacilitatorVerifyRequest,
  FacilitatorVerifyResponse,
  FacilitatorSettleResponse,
} from "./types.js";

const FACILITATOR_URL = process.env.FACILITATOR_URL!;

export async function verifyPayment(
  paymentPayload: unknown,
  paymentRequirements: unknown,
): Promise<FacilitatorVerifyResponse> {
  const body: FacilitatorVerifyRequest = {
    x402Version: 2,
    paymentPayload,
    paymentRequirements,
  };

  const res = await fetch(`${FACILITATOR_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`facilitator verify HTTP ${res.status}`);
  }

  return res.json() as Promise<FacilitatorVerifyResponse>;
}

export async function settlePayment(
  paymentPayload: unknown,
  paymentRequirements: unknown,
): Promise<FacilitatorSettleResponse> {
  const body: FacilitatorVerifyRequest = {
    x402Version: 2,
    paymentPayload,
    paymentRequirements,
  };

  const res = await fetch(`${FACILITATOR_URL}/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`facilitator settle HTTP ${res.status}`);
  }

  return res.json() as Promise<FacilitatorSettleResponse>;
}
