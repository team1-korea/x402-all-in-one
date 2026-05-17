import type React from 'react'
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
