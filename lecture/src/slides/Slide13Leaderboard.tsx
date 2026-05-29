import { useEffect, useState } from 'react'
import QuestGrid, { type QuestGridUser } from '../admin/QuestGrid'

interface Props { animKey: number }

interface DashboardStats {
  totalUsers: number
  completedUsers: number
  totalQuestAccesses: number
  marathonStartedAt: string | null
  users: QuestGridUser[]
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'https://x402.abcfe.net'

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
      <QuestGrid users={stats.users} marathonStartedAt={stats.marathonStartedAt} />
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
