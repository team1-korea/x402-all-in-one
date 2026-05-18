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

export default function Slide13Leaderboard({ animKey: _ }: Props) {
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
      <div className="slide bg-beige content-z-index">
        <p className="font-mono text-sm text-sage animate-pulse">대시보드 로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="slide bg-beige" style={{ justifyContent: 'flex-start', alignItems: 'center', padding: '3rem 4rem', overflowX: 'auto' }}>
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6 pb-5 border-b border-forest/15 flex-shrink-0 content-z-index">
        <div className="flex items-center gap-3">
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#3D6B4F', animation: 'pulse 1.5s infinite' }} />
          <span className="font-mono font-semibold text-lg text-forest tracking-wide">Quest Dashboard</span>
        </div>
        <div className="flex gap-6">
          <StatBox num={stats.totalUsers} label="참가자" />
          <StatBox num={stats.completedUsers} label="완료" />
          <StatBox num={stats.totalQuestAccesses} label="퀘스트 접근" />
        </div>
      </div>

      {/* Matrix */}
      {stats.users.length === 0 ? (
        <p className="font-mono text-sm text-sage/50 mt-16">아직 참가자가 없습니다</p>
      ) : (
        <div style={{ overflowX: 'auto', flex: 1, width: '100%' }} className="content-z-index">
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
                    className="font-mono text-sage/50"
                    style={{ fontSize: 10, textAlign: 'right', paddingRight: 8, verticalAlign: 'middle', whiteSpace: 'nowrap' }}
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
    <div className="text-right">
      <div className="font-mono font-bold text-2xl text-terracotta">{num}</div>
      <div className="font-mono text-sage uppercase tracking-widest" style={{ fontSize: 10 }}>{label}</div>
    </div>
  )
}

function UserHeader({ user }: { user: DashboardUser }) {
  const isCompleted = user.isCompleted
  const newUser = isNew(user.registeredAt)
  const borderColor = isCompleted ? '#3D6B4F' : newUser ? '#C4714A' : '#d4cfc5'
  const nameColor = isCompleted ? '#3D6B4F' : newUser ? '#C4714A' : '#1A1A1A'

  return (
    <div
      className="font-mono"
      style={{
        background: '#FFFDF9',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 8,
        padding: '6px 4px',
        textAlign: 'center',
        minWidth: 60,
        marginBottom: 2,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: nameColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 64 }}>
        {user.nickname}
      </div>
      <div style={{ fontSize: 9, color: '#7A9E87' }}>{user.purchasedSteps.length}/10</div>
    </div>
  )
}

function QuestCell({ step, user }: { step: number; user: DashboardUser }) {
  const done = user.purchasedSteps.includes(step)
  const maxStep = getMaxStep(user.purchasedSteps)
  const isCurrent = done && step === maxStep && !user.isCompleted

  const base: React.CSSProperties = {
    width: 60,
    height: 28,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'monospace',
  }

  if (isCurrent) {
    return <div style={{ ...base, background: '#C4714A', color: '#FFFDF9', animation: 'pulse 1s step-end infinite' }}>▶</div>
  }
  if (done) {
    return <div style={{ ...base, background: '#3D6B4F', color: '#FFFDF9' }}>✓</div>
  }
  return <div style={{ ...base, background: '#F5F0E8', border: '1px solid #d4cfc5' }} />
}
