import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DB_FILE = join(DATA_DIR, "users.json");
const TOKENS_FILE = join(DATA_DIR, "questtokens.json");

export interface UserRecord {
  walletAddress: string;
  privateKey: string;
  registeredAt: string;
  initialAirdropTx?: string;
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

function loadUsers(): Record<string, UserRecord> {
  if (!existsSync(DB_FILE)) return {};
  return JSON.parse(readFileSync(DB_FILE, "utf8"));
}

function saveUsers(data: Record<string, UserRecord>) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function loadTokens(): Record<string, QuestToken> {
  if (!existsSync(TOKENS_FILE)) return {};
  return JSON.parse(readFileSync(TOKENS_FILE, "utf8"));
}

function saveTokens(data: Record<string, QuestToken>) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(TOKENS_FILE, JSON.stringify(data, null, 2));
}

export function createUser(record: UserRecord): void {
  const db = loadUsers();
  db[record.walletAddress.toLowerCase()] = record;
  saveUsers(db);
}

export function getUser(walletAddress: string): UserRecord | undefined {
  return loadUsers()[walletAddress.toLowerCase()];
}

export function listUsers(): UserRecord[] {
  return Object.values(loadUsers());
}

export function updateQuestStatus(
  walletAddress: string,
  productId: string,
  step: number,
  isCompleted: boolean,
): void {
  const db = loadUsers();
  const user = db[walletAddress.toLowerCase()];
  if (user) {
    user.currentProductId = productId;
    user.currentStep = step;
    user.isCompleted = isCompleted;
    saveUsers(db);
  }
}

export function addPurchasedStep(
  walletAddress: string,
  productId: string,
  step: number,
): void {
  const db = loadUsers();
  const user = db[walletAddress.toLowerCase()];
  if (user) {
    if (!user.purchasedSteps) user.purchasedSteps = [];
    if (!user.purchasedSteps.includes(step)) {
      user.purchasedSteps.push(step);
    }
    if (!user.currentProductId) user.currentProductId = productId;
    saveUsers(db);
  }
}

export function storeQuestToken(token: QuestToken): void {
  const tokens = loadTokens();
  tokens[token.uuid] = token;
  saveTokens(tokens);
}

export function getQuestToken(uuid: string): QuestToken | undefined {
  return loadTokens()[uuid];
}

export function getQuestTokenByStep(
  walletAddress: string,
  productId: string,
  step: number,
): QuestToken | undefined {
  return Object.values(loadTokens()).find(
    (t) =>
      t.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
      t.productId === productId &&
      t.step === step,
  );
}
