import { supabase } from "./supabase.js";

export interface UserRecord {
  walletAddress: string;
  privateKey: string;
  registeredAt: string;
  initialAirdropTx?: string;
  nickname?: string;
  currentProductId?: string;
  currentStep?: number;
  isCompleted?: boolean;
  purchasedSteps?: number[];
}

export interface QuestToken {
  uuid: string;
  productId: string;
  step: number;
  walletAddress: string;
  createdAt: string;
}

// ── Users ────────────────────────────────────────────────

function toRecord(row: Record<string, unknown>): UserRecord {
  return {
    walletAddress: row.wallet_address as string,
    privateKey: row.private_key as string,
    registeredAt: row.registered_at as string,
    initialAirdropTx: row.initial_airdrop_tx as string | undefined,
    nickname: row.nickname as string | undefined,
    currentProductId: row.current_product_id as string | undefined,
    currentStep: row.current_step as number | undefined,
    isCompleted: row.is_completed as boolean | undefined,
    purchasedSteps: row.purchased_steps as number[] | undefined,
  };
}

export async function createUser(record: UserRecord): Promise<void> {
  await supabase.from("users").upsert({
    wallet_address: record.walletAddress.toLowerCase(),
    private_key: record.privateKey,
    registered_at: record.registeredAt,
    initial_airdrop_tx: record.initialAirdropTx,
    nickname: record.nickname ?? null,
  });
}

export async function getUser(walletAddress: string): Promise<UserRecord | undefined> {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();
  return data ? toRecord(data as Record<string, unknown>) : undefined;
}

export async function listUsers(): Promise<UserRecord[]> {
  const { data } = await supabase.from("users").select("*");
  return (data ?? []).map((r) => toRecord(r as Record<string, unknown>));
}

export async function updateQuestStatus(
  walletAddress: string,
  productId: string,
  step: number,
  isCompleted: boolean,
): Promise<void> {
  await supabase.from("users").update({
    current_product_id: productId,
    current_step: step,
    is_completed: isCompleted,
  }).eq("wallet_address", walletAddress.toLowerCase());
}

export async function addPurchasedStep(
  walletAddress: string,
  productId: string,
  step: number,
): Promise<void> {
  const user = await getUser(walletAddress);
  if (!user) return;
  const steps = user.purchasedSteps ?? [];
  if (steps.includes(step)) return;
  await supabase.from("users").update({
    purchased_steps: [...steps, step],
    current_product_id: user.currentProductId ?? productId,
  }).eq("wallet_address", walletAddress.toLowerCase());
}

// ── Quest Tokens ─────────────────────────────────────────

export async function storeQuestToken(token: QuestToken): Promise<void> {
  await supabase.from("quest_tokens").insert({
    uuid: token.uuid,
    product_id: token.productId,
    step: token.step,
    wallet_address: token.walletAddress.toLowerCase(),
    created_at: token.createdAt,
  });
}

export async function getQuestToken(uuid: string): Promise<QuestToken | undefined> {
  const { data } = await supabase
    .from("quest_tokens")
    .select("*")
    .eq("uuid", uuid)
    .single();
  if (!data) return undefined;
  const row = data as Record<string, unknown>;
  return {
    uuid: row.uuid as string,
    productId: row.product_id as string,
    step: row.step as number,
    walletAddress: row.wallet_address as string,
    createdAt: row.created_at as string,
  };
}

export async function getQuestTokenByStep(
  walletAddress: string,
  productId: string,
  step: number,
): Promise<QuestToken | undefined> {
  const { data } = await supabase
    .from("quest_tokens")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .eq("product_id", productId)
    .eq("step", step)
    .single();
  if (!data) return undefined;
  const row = data as Record<string, unknown>;
  return {
    uuid: row.uuid as string,
    productId: row.product_id as string,
    step: row.step as number,
    walletAddress: row.wallet_address as string,
    createdAt: row.created_at as string,
  };
}

// ── Quest Answers ─────────────────────────────────────────

export async function recordAnswer(
  walletAddress: string,
  productId: string,
  step: number,
  questType: string,
  answers: unknown,
  isCorrect: boolean,
): Promise<void> {
  await supabase.from("quest_answers").insert({
    wallet_address: walletAddress.toLowerCase(),
    product_id: productId,
    step,
    quest_type: questType,
    answers,
    is_correct: isCorrect,
  });
}

// ── Feedback ──────────────────────────────────────────────

export async function recordFeedback(
  walletAddress: string,
  good: string,
  bad: string,
  next: string,
): Promise<void> {
  await supabase.from("feedback").insert({
    wallet_address: walletAddress.toLowerCase(),
    good,
    bad,
    next,
  });
}

// ── Interests ─────────────────────────────────────────────

export async function recordInterests(
  walletAddress: string,
  tags: string[],
): Promise<void> {
  await supabase.from("interests").insert({
    wallet_address: walletAddress.toLowerCase(),
    tags,
  });
}
