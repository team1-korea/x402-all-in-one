# Quest Progress Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 워크샵 진행자가 프로젝터에 띄울 실시간 퀘스트 진행 대시보드를 구현한다. 참가자가 등록하거나 퀘스트를 구매할 때 Slide12Leaderboard가 3초 폴링으로 자동 갱신된다.

**Architecture:** x402-server에 `/v1/dashboard/stats` 엔드포인트를 추가하고, lecture 앱의 `Slide12Leaderboard.tsx`가 3초마다 그 엔드포인트를 폴링해 Q1~Q10 세로 × 참가자 가로 매트릭스를 렌더링한다. 등록 시 nickname을 함께 저장해 대시보드에서 표시한다.

**Tech Stack:** Express (x402-server), Supabase, React + Tailwind (lecture), Vitest + Testing Library (lecture tests)

---

## File Map

| 파일 | 역할 |
|------|------|
| `supabase/schema.sql` | nickname 컬럼 ALTER 문서화 |
| `x402-server/src/db.ts` | UserRecord에 nickname 추가, CRUD 반영 |
| `x402-server/src/routes/users.ts` | POST /v1/register에서 nickname 파싱 |
| `x402-server/src/routes/dashboard.ts` | 신규 — GET /v1/dashboard/stats |
| `x402-server/src/index.ts` | dashboard 라우터 등록 |
| `lecture/.env` | 신규 — VITE_SERVER_URL |
| `lecture/src/slides/Slide12Leaderboard.tsx` | 완전 교체 — 라이브 매트릭스 |
| `lecture/src/slides/Slide12Leaderboard.test.tsx` | 신규 — 컴포넌트 테스트 |
| `x402-skills/quest/SKILL.md` | Step 0 nickname 지침 추가 |

---

## Task 1: Supabase 스키마 — nickname 컬럼 추가

**Files:**
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Supabase SQL Editor에서 ALTER TABLE 실행**

  Supabase 대시보드 → SQL Editor 에서 아래를 실행한다:
  ```sql
  ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname TEXT;
  ```

- [ ] **Step 2: schema.sql에 문서용 컬럼 추가**

  `supabase/schema.sql`의 users 테이블 정의에 아래 줄을 추가한다:
  ```sql
  CREATE TABLE IF NOT EXISTS users (
    wallet_address  TEXT PRIMARY KEY,
    private_key     TEXT NOT NULL,
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    initial_airdrop_tx TEXT,
    nickname        TEXT,
    current_product_id TEXT,
    current_step    INTEGER NOT NULL DEFAULT 0,
    is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    purchased_steps INTEGER[] NOT NULL DEFAULT '{}'
  );
  ```

- [ ] **Step 3: Supabase에서 컬럼 확인**

  SQL Editor에서 실행해 에러 없이 결과가 나오는지 확인한다:
  ```sql
  SELECT wallet_address, nickname FROM users LIMIT 1;
  ```

- [ ] **Step 4: 커밋**
  ```bash
  git add supabase/schema.sql
  git commit -m "feat(db): add nickname column to users table"
  ```

---

## Task 2: db.ts — nickname 필드 추가

**Files:**
- Modify: `x402-server/src/db.ts`

- [ ] **Step 1: UserRecord 타입에 nickname 추가**

  `UserRecord` 인터페이스를 아래와 같이 수정한다:
  ```typescript
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
  ```

- [ ] **Step 2: toRecord에 nickname 매핑 추가**

  `toRecord` 함수를 아래와 같이 수정한다:
  ```typescript
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
  ```

- [ ] **Step 3: createUser에 nickname 저장 추가**

  `createUser` 함수를 아래와 같이 수정한다:
  ```typescript
  export async function createUser(record: UserRecord): Promise<void> {
    await supabase.from("users").upsert({
      wallet_address: record.walletAddress.toLowerCase(),
      private_key: record.privateKey,
      registered_at: record.registeredAt,
      initial_airdrop_tx: record.initialAirdropTx,
      nickname: record.nickname ?? null,
    });
  }
  ```

- [ ] **Step 4: 타입체크 통과 확인**
  ```bash
  cd x402-server && npm run typecheck
  ```
  Expected: 에러 없음

- [ ] **Step 5: 커밋**
  ```bash
  git add x402-server/src/db.ts
  git commit -m "feat(db): add nickname field to UserRecord and CRUD"
  ```

---

## Task 3: users.ts — POST /v1/register에서 nickname 수신

**Files:**
- Modify: `x402-server/src/routes/users.ts`

- [ ] **Step 1: 라우트 핸들러에서 req.body.nickname 파싱**

  `users.ts` 전체를 아래로 교체한다:
  ```typescript
  import { Router, type Request, type Response } from "express";
  import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
  import { airdrop } from "../airdrop.js";
  import { createUser, getUser } from "../db.js";

  const router = Router();

  // 100 USDC (6 decimals) = 10 quests × 10 USDC
  const INITIAL_AIRDROP = BigInt(100 * 1_000_000);

  // POST /v1/register
  router.post("/", async (req: Request, res: Response) => {
    const nickname = req.body?.nickname as string | undefined;

    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const walletAddress = account.address;

    if (await getUser(walletAddress)) {
      res.status(409).json({ error: "이미 등록된 주소입니다" });
      return;
    }

    let airdropTx: string | undefined;
    try {
      airdropTx = await airdrop(walletAddress, INITIAL_AIRDROP);
    } catch (e) {
      console.error("초기 에어드랍 실패:", String(e));
    }

    await createUser({
      walletAddress,
      privateKey,
      registeredAt: new Date().toISOString(),
      initialAirdropTx: airdropTx,
      nickname,
    });

    res.json({
      walletAddress,
      privateKey,
      network: `eip155:${process.env.CHAIN_ID || "402"}`,
      initialAirdrop: "100 USDC",
      airdropTx,
      hint: "이 privateKey로 X-PAYMENT 서명을 생성하세요. 안전한 곳에 보관하세요.",
    });
  });

  export default router;
  ```

- [ ] **Step 2: 타입체크 통과 확인**
  ```bash
  cd x402-server && npm run typecheck
  ```
  Expected: 에러 없음

- [ ] **Step 3: 커밋**
  ```bash
  git add x402-server/src/routes/users.ts
  git commit -m "feat(api): accept nickname in POST /v1/register"
  ```

---

## Task 4: dashboard.ts — GET /v1/dashboard/stats 엔드포인트

**Files:**
- Create: `x402-server/src/routes/dashboard.ts`

- [ ] **Step 1: dashboard.ts 신규 파일 생성**

  ```typescript
  import { Router, type Request, type Response } from "express";
  import { listUsers } from "../db.js";

  const router = Router();

  function truncateWallet(address: string): string {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }

  // GET /v1/dashboard/stats
  router.get("/stats", async (_req: Request, res: Response) => {
    const users = await listUsers();

    const sorted = [...users].sort(
      (a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
    );

    const totalQuestAccesses = sorted.reduce(
      (sum, u) => sum + (u.purchasedSteps?.length ?? 0),
      0
    );

    res.json({
      totalUsers: sorted.length,
      completedUsers: sorted.filter((u) => u.isCompleted).length,
      totalQuestAccesses,
      users: sorted.map((u) => ({
        nickname: u.nickname ?? truncateWallet(u.walletAddress),
        walletAddress: truncateWallet(u.walletAddress),
        purchasedSteps: u.purchasedSteps ?? [],
        isCompleted: u.isCompleted ?? false,
        registeredAt: u.registeredAt,
      })),
    });
  });

  export default router;
  ```

- [ ] **Step 2: 타입체크 통과 확인**
  ```bash
  cd x402-server && npm run typecheck
  ```
  Expected: 에러 없음

- [ ] **Step 3: 커밋**
  ```bash
  git add x402-server/src/routes/dashboard.ts
  git commit -m "feat(api): add GET /v1/dashboard/stats endpoint"
  ```

---

## Task 5: index.ts — dashboard 라우터 등록

**Files:**
- Modify: `x402-server/src/index.ts`

- [ ] **Step 1: dashboard 라우터 import 및 등록**

  `index.ts`에 아래 import를 추가한다 (기존 import 블록 맨 아래):
  ```typescript
  import dashboardRouter from "./routes/dashboard.js";
  ```

  그리고 `app.use("/quest-api", questApiRouter);` 아래에 추가한다:
  ```typescript
  app.use("/v1/dashboard", dashboardRouter);
  ```

- [ ] **Step 2: 서버 기동 후 엔드포인트 확인**

  서버를 실행한 뒤 (별도 터미널에서 `cd x402-server && npm run dev`):
  ```bash
  curl http://localhost:4010/v1/dashboard/stats
  ```
  Expected: `{"totalUsers":...,"completedUsers":...,"totalQuestAccesses":...,"users":[...]}` 형태의 JSON

- [ ] **Step 3: 커밋**
  ```bash
  git add x402-server/src/index.ts
  git commit -m "feat(server): register dashboard router at /v1/dashboard"
  ```

---

## Task 6: lecture/.env 및 vite-env.d.ts 생성

**Files:**
- Create: `lecture/.env`
- Create: `lecture/src/vite-env.d.ts`

- [ ] **Step 1: vite-env.d.ts 생성 — env 타입 선언**

  `lecture/src/vite-env.d.ts` 파일을 생성한다:
  ```typescript
  /// <reference types="vite/client" />

  interface ImportMetaEnv {
    readonly VITE_SERVER_URL?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  ```

- [ ] **Step 2: .env 파일 생성**

  `lecture/.env` 파일을 생성한다:
  ```
  VITE_SERVER_URL=http://localhost:4010
  ```

  > 실제 배포 서버 주소가 다르면 이 값을 변경한다.

- [ ] **Step 3: .gitignore 확인**

  `lecture/.env`가 git에 올라가지 않도록 프로젝트 루트 `.gitignore`에 `lecture/.env` 또는 `**/.env` 패턴이 있는지 확인한다. 없으면 추가한다.

  ```bash
  grep -r "\.env" .gitignore 2>/dev/null || echo "not found"
  ```

- [ ] **Step 4: 커밋 (vite-env.d.ts만, .env 제외)**
  ```bash
  git add lecture/src/vite-env.d.ts .gitignore
  git commit -m "chore(lecture): add vite-env.d.ts for VITE_SERVER_URL type"
  ```
  > `lecture/.env`는 커밋하지 않는다.

---

## Task 7: Slide12Leaderboard.test.tsx — 컴포넌트 테스트 작성

**Files:**
- Create: `lecture/src/slides/Slide12Leaderboard.test.tsx`

- [ ] **Step 1: 테스트 파일 생성 (실패 확인용)**

  ```typescript
  import { render, screen, waitFor } from '@testing-library/react'
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
  import Slide12Leaderboard from './Slide12Leaderboard'

  const mockStats = {
    totalUsers: 2,
    completedUsers: 1,
    totalQuestAccesses: 6,
    users: [
      {
        nickname: '홍길동',
        walletAddress: '0x1234…abcd',
        purchasedSteps: [1, 2, 3],
        isCompleted: false,
        registeredAt: new Date().toISOString(),
      },
      {
        nickname: '이영희',
        walletAddress: '0x5678…efgh',
        purchasedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        isCompleted: true,
        registeredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
    ],
  }

  describe('Slide12Leaderboard', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockStats),
      } as unknown as Response)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('로딩 중 텍스트를 초기에 표시한다', () => {
      global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
      render(<Slide12Leaderboard animKey={0} />)
      expect(screen.getByText(/로딩 중/)).toBeInTheDocument()
    })

    it('fetch 후 참가자 닉네임을 렌더링한다', async () => {
      render(<Slide12Leaderboard animKey={0} />)
      await waitFor(() => expect(screen.getByText('홍길동')).toBeInTheDocument())
      expect(screen.getByText('이영희')).toBeInTheDocument()
    })

    it('헤더에 통계를 표시한다', async () => {
      render(<Slide12Leaderboard animKey={0} />)
      await waitFor(() => expect(screen.getByText('참가자')).toBeInTheDocument())
    })

    it('Q1~Q10 행 레이블을 렌더링한다', async () => {
      render(<Slide12Leaderboard animKey={0} />)
      await waitFor(() => expect(screen.getByText('Q1')).toBeInTheDocument())
      expect(screen.getByText('Q10')).toBeInTheDocument()
    })
  })
  ```

- [ ] **Step 2: 테스트 실행 — 실패 확인**
  ```bash
  cd lecture && npm test
  ```
  Expected: FAIL (Slide12Leaderboard가 아직 이전 버전이므로 로딩 중 텍스트 없음)

---

## Task 8: Slide12Leaderboard.tsx — 라이브 매트릭스 컴포넌트

**Files:**
- Modify: `lecture/src/slides/Slide12Leaderboard.tsx`

- [ ] **Step 1: 컴포넌트 전체 교체**

  `lecture/src/slides/Slide12Leaderboard.tsx`를 아래로 교체한다:

  ```typescript
  import { useEffect, useState } from 'react'

  interface Props { animKey: number }

  interface DashboardUser {
    nickname: string
    walletAddress: string
    purchasedSteps: number[]
    isCompleted: boolean
    registeredAt: string
  }

  interface DashboardStats {
    totalUsers: number
    completedUsers: number
    totalQuestAccesses: number
    users: DashboardUser[]
  }

  const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4010'
  const QUEST_COUNT = 10
  const NEW_USER_MS = 5 * 60 * 1000

  function isNew(registeredAt: string): boolean {
    return Date.now() - new Date(registeredAt).getTime() < NEW_USER_MS
  }

  function getMaxStep(steps: number[]): number {
    return steps.length > 0 ? Math.max(...steps) : 0
  }

  export default function Slide12Leaderboard({ animKey: _ }: Props) {
    const [stats, setStats] = useState<DashboardStats | null>(null)

    useEffect(() => {
      const fetchStats = () => {
        fetch(`${SERVER_URL}/v1/dashboard/stats`)
          .then((r) => r.json())
          .then((data: DashboardStats) => setStats(data))
          .catch((e: unknown) => console.warn('Dashboard fetch failed:', e))
      }

      fetchStats()
      const id = setInterval(fetchStats, 3000)
      return () => clearInterval(id)
    }, [])

    if (!stats) {
      return (
        <div className="slide" style={{ background: '#0f1a14' }}>
          <p className="font-mono text-sm animate-pulse" style={{ color: '#5a8068' }}>
            대시보드 로딩 중...
          </p>
        </div>
      )
    }

    return (
      <div
        className="slide"
        style={{
          background: '#0f1a14',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          padding: '2rem',
          overflowX: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #2a4030',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4ade80',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span className="font-mono font-bold" style={{ fontSize: '1.1rem', color: '#7eca9c' }}>
              Quest Dashboard
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <StatBox num={stats.totalUsers} label="참가자" />
            <StatBox num={stats.completedUsers} label="완료" />
            <StatBox num={stats.totalQuestAccesses} label="퀘스트 접근" />
          </div>
        </div>

        {/* Matrix */}
        {stats.users.length === 0 ? (
          <p className="font-mono text-sm text-center" style={{ color: '#3a5040', marginTop: '4rem' }}>
            아직 참가자가 없습니다
          </p>
        ) : (
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ borderSpacing: '4px', borderCollapse: 'separate' }}>
              <thead>
                <tr>
                  <th style={{ width: '2.5rem' }} />
                  {stats.users.map((u) => (
                    <th key={u.walletAddress} style={{ padding: 0, verticalAlign: 'bottom' }}>
                      <UserHeader user={u} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: QUEST_COUNT }, (_, i) => i + 1).map((q) => (
                  <tr key={q}>
                    <td
                      className="font-mono"
                      style={{
                        fontSize: '10px',
                        color: '#3a5040',
                        textAlign: 'right',
                        paddingRight: '8px',
                        verticalAlign: 'middle',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Q{q}
                    </td>
                    {stats.users.map((u) => (
                      <td key={u.walletAddress} style={{ padding: 0 }}>
                        <QuestCell step={q} user={u} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  function StatBox({ num, label }: { num: number; label: string }) {
    return (
      <div style={{ textAlign: 'right' }}>
        <div className="font-mono font-bold" style={{ fontSize: '1.5rem', color: '#7eca9c' }}>{num}</div>
        <div className="font-mono" style={{ fontSize: '10px', color: '#5a8068', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      </div>
    )
  }

  function UserHeader({ user }: { user: DashboardUser }) {
    const borderColor = user.isCompleted
      ? '#4ade80'
      : isNew(user.registeredAt)
      ? '#60a5fa'
      : '#2a4030'
    const nameColor = isNew(user.registeredAt) && !user.isCompleted ? '#60a5fa' : '#d4ede0'

    return (
      <div
        className="font-mono"
        style={{
          background: '#1a2b20',
          border: `1px solid ${borderColor}`,
          borderRadius: '8px',
          padding: '6px 4px',
          textAlign: 'center',
          minWidth: '60px',
          marginBottom: '2px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: nameColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '64px',
          }}
        >
          {user.nickname}
        </div>
        <div style={{ fontSize: '9px', color: '#5a8068' }}>
          {user.purchasedSteps.length}/10
        </div>
      </div>
    )
  }

  function QuestCell({ step, user }: { step: number; user: DashboardUser }) {
    const done = user.purchasedSteps.includes(step)
    const maxStep = getMaxStep(user.purchasedSteps)
    const isCurrent = done && step === maxStep && !user.isCompleted

    const base: React.CSSProperties = {
      width: '60px',
      height: '28px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 700,
      fontFamily: 'monospace',
    }

    if (isCurrent) {
      return (
        <div style={{ ...base, background: '#fbbf24', color: '#0f1a14', animation: 'pulse 1s step-end infinite' }}>
          ▶
        </div>
      )
    }
    if (done) {
      return <div style={{ ...base, background: '#4ade80', color: '#0f1a14' }}>✓</div>
    }
    return <div style={{ ...base, background: '#2a4030' }} />
  }
  ```

- [ ] **Step 2: 테스트 실행 — 통과 확인**
  ```bash
  cd lecture && npm test
  ```
  Expected: 4개 테스트 모두 PASS

- [ ] **Step 3: 타입체크 통과 확인**
  ```bash
  cd lecture && npx tsc --noEmit
  ```
  Expected: 에러 없음

- [ ] **Step 4: 커밋**
  ```bash
  git add lecture/src/slides/Slide12Leaderboard.tsx lecture/src/slides/Slide12Leaderboard.test.tsx
  git commit -m "feat(lecture): replace Slide12Leaderboard with live quest matrix dashboard"
  ```

---

## Task 9: x402-skills/quest/SKILL.md — nickname 지침 추가

**Files:**
- Modify: `x402-skills/quest/SKILL.md`

- [ ] **Step 1: Step 0 curl 명령 및 닉네임 지침 업데이트**

  `SKILL.md`의 `## Step 0 — 등록 & 에어드랍 (최초 1회)` 섹션에서 curl 명령 앞에 아래 지침을 추가한다:

  ```markdown
  ## Step 0 — 등록 & 에어드랍 (최초 1회)

  `.x402-wallet.json` 파일이 현재 디렉터리에 있는지 확인합니다.

  **파일이 없으면:**

  먼저 사용자에게 닉네임(대시보드에 표시될 이름)을 물어보세요. 예: "대시보드에 표시할 닉네임을 알려주세요 (예: 홍길동)".

  닉네임을 받은 후 등록합니다:
  ```bash
  curl -X POST http://localhost:4010/v1/register \
    -H "Content-Type: application/json" \
    -d '{"nickname": "<사용자가 입력한 닉네임>"}'
  ```
  ```

  그 아래 wallet 저장 및 파일 내용 등 기존 내용은 그대로 유지한다.

- [ ] **Step 2: 커밋**
  ```bash
  git add x402-skills/quest/SKILL.md
  git commit -m "feat(skill): prompt for nickname before registration in x402-quest"
  ```

---

## 최종 검증

- [ ] `cd lecture && npm test` — 테스트 4개 PASS
- [ ] `cd x402-server && npm run typecheck` — 에러 없음
- [ ] x402-server 실행 후 `curl http://localhost:4010/v1/dashboard/stats` — JSON 응답 확인
- [ ] lecture 앱 실행(`cd lecture && npm run dev`) → 슬라이드 12로 이동 — 대시보드 매트릭스 표시 확인
- [ ] 테스트 유저 등록 후 `/v1/dashboard/stats` 재호출 — 응답에 유저 포함 확인
