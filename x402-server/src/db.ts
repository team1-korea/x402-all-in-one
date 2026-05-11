import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DB_FILE = join(DATA_DIR, "users.json");

export interface UserRecord {
  walletAddress: string;
  privateKey: string;
  registeredAt: string;
  initialAirdropTx?: string;
  
  // 퀘스트 상태 추가
  currentProductId?: string; // 현재 선택한 상품 ID
  currentStep?: number;      // 현재 진행 중인 단계 (1~10)
  isCompleted?: boolean;     // 완주 여부
}

function load(): Record<string, UserRecord> {
  if (!existsSync(DB_FILE)) return {};
  return JSON.parse(readFileSync(DB_FILE, "utf8"));
}

function save(data: Record<string, UserRecord>) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function createUser(record: UserRecord): void {
  const db = load();
  db[record.walletAddress.toLowerCase()] = record;
  save(db);
}

export function getUser(walletAddress: string): UserRecord | undefined {
  return load()[walletAddress.toLowerCase()];
}

export function listUsers(): UserRecord[] {
  return Object.values(load());
}

export function updateQuestStatus(walletAddress: string, productId: string, step: number, isCompleted: boolean): void {
  const db = load();
  const user = db[walletAddress.toLowerCase()];
  if (user) {
    user.currentProductId = productId;
    user.currentStep = step;
    user.isCompleted = isCompleted;
    save(db);
  }
}
