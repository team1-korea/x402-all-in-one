import type React from 'react'
import { useEffect, useState } from 'react'

interface Props { animKey: number }

interface DashboardUser {
  nickname: string
  walletAddress: string
  purchasedSteps: number[]
  completedSteps: number[]
  isCompleted: boolean
  completedAt: string | null
  registeredAt: string
}

interface DashboardStats {
  totalUsers: number
  completedUsers: number
  totalQuestAccesses: number
  marathonStartedAt: string | null
  users: DashboardUser[]
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'https://x402.abcfe.net'
const QUEST_COUNT = 10
const NEW_USER_MS = 5 * 60 * 1000

function isNew(registeredAt: string): boolean {
  return Date.now() - new Date(registeredAt).getTime() < NEW_USER_MS
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
    <div
      className="slide bg-beige"
      style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', padding: '2rem 3rem', overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-forest/15 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#3D6B4F', animation: 'pulse 1.5s infinite' }} />
          <span className="font-mono font-semibold text-lg text-forest tracking-wide">Quest Dashboard</span>
        </div>
        <div className="flex gap-6">
          <StatBox num={stats.totalUsers} label="참가자" />
          <StatBox num={stats.completedUsers} label="완료" />
          <StatBox num={stats.totalQuestAccesses} label="퀘스트 접근" />
        </div>
        {stats.marathonStartedAt && (
          <div className="font-mono text-xs text-sage/60 mt-1 text-right">
            마라톤 시작: {new Date(stats.marathonStartedAt).toLocaleTimeString('ko-KR')}
          </div>
        )}
      </div>

      {/* Matrix */}
      {stats.users.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-sm text-sage/50">아직 참가자가 없습니다</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'stretch' }}>
          <table style={{ width: '100%', height: '100%', borderSpacing: '4px', borderCollapse: 'separate', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '2rem' }} />
                {stats.users.map((u, i) => (
                  <th key={u.walletAddress} style={{ padding: '0 2px 4px', verticalAlign: 'bottom' }}>
                    <UserHeader user={u} rank={u.isCompleted ? i + 1 : undefined} marathonStartedAt={stats.marathonStartedAt} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: QUEST_COUNT }, (_, i) => i + 1).map((q) => (
                <tr key={q} style={{ height: `${90 / QUEST_COUNT}%` }}>
                  <td
                    className="font-mono text-sage/50"
                    style={{ fontSize: 10, textAlign: 'right', paddingRight: 6, verticalAlign: 'middle', whiteSpace: 'nowrap' }}
                  >
                    Q{q}
                  </td>
                  {stats.users.map((u) => (
                    <td key={u.walletAddress} style={{ padding: '2px' }}>
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

function formatElapsed(completedAt: string, startedAt: string): string {
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  if (ms < 0) return '-'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `+${m}분 ${s}초`
}

function UserHeader({ user, rank, marathonStartedAt }: { user: DashboardUser; rank?: number; marathonStartedAt: string | null }) {
  const isCompleted = user.isCompleted
  const newUser = isNew(user.registeredAt)
  const borderColor = isCompleted ? '#3D6B4F' : newUser ? '#C4714A' : '#d4cfc5'
  const nameColor = isCompleted ? '#3D6B4F' : newUser ? '#C4714A' : '#1A1A1A'
  const elapsed = isCompleted && user.completedAt && marathonStartedAt
    ? formatElapsed(user.completedAt, marathonStartedAt)
    : null

  return (
    <div
      className="font-mono"
      style={{
        background: '#FFFDF9',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 8,
        padding: '5px 4px',
        textAlign: 'center',
        marginBottom: 2,
      }}
    >
      {rank !== undefined && (
        <div style={{ fontSize: 9, color: '#C4714A', fontWeight: 700 }}>{rank}위</div>
      )}
      <div style={{ fontSize: 11, fontWeight: 600, color: nameColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.nickname}
      </div>
      <div style={{ fontSize: 9, color: '#7A9E87' }}>{user.completedSteps.length}/10</div>
      {elapsed && (
        <div style={{ fontSize: 8, color: '#3D6B4F', marginTop: 1 }}>{elapsed}</div>
      )}
    </div>
  )
}

function QuestCell({ step, user }: { step: number; user: DashboardUser }) {
  const completed = user.completedSteps.includes(step)
  const purchased = user.purchasedSteps.includes(step)

  const base: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: 24,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'monospace',
  }

  if (completed) {
    return <div style={{ ...base, background: '#3D6B4F', color: '#FFFDF9' }}>✓</div>
  }
  if (purchased) {
    return <div style={{ ...base, background: '#C4714A', color: '#FFFDF9', animation: 'pulse 1s step-end infinite' }}>▶</div>
  }
  return <div style={{ ...base, background: '#F5F0E8', border: '1px solid #d4cfc5' }} />
}
