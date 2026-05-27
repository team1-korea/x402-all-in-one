import type React from 'react'

export interface QuestGridUser {
  nickname: string
  walletAddress: string
  purchasedSteps: number[]
  completedSteps: number[]
  isCompleted: boolean
  completedAt: string | null
  registeredAt: string
}

interface Props {
  users: QuestGridUser[]
  marathonStartedAt: string | null
  onCellClick?: (walletAddress: string, step: number) => void
}

const QUEST_COUNT = 10
const NEW_USER_MS = 5 * 60 * 1000

function isNew(registeredAt: string): boolean {
  return Date.now() - new Date(registeredAt).getTime() < NEW_USER_MS
}

function formatElapsed(completedAt: string, startedAt: string): string {
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  if (ms < 0) return '-'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `+${m}분 ${s}초`
}

export default function QuestGrid({ users, marathonStartedAt, onCellClick }: Props) {
  if (users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-mono text-sm text-sage/50">아직 참가자가 없습니다</p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'stretch' }}>
      <table style={{ width: '100%', height: '100%', borderSpacing: '4px', borderCollapse: 'separate', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ width: '2rem' }} />
            {users.map((u, i) => (
              <th key={u.walletAddress} style={{ padding: '0 2px 4px', verticalAlign: 'bottom' }}>
                <UserHeader user={u} rank={u.isCompleted ? i + 1 : undefined} marathonStartedAt={marathonStartedAt} />
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
              {users.map((u) => (
                <td key={u.walletAddress} style={{ padding: '2px' }}>
                  <QuestCell
                    step={q}
                    user={u}
                    onClick={onCellClick && !u.completedSteps.includes(q)
                      ? () => onCellClick(u.walletAddress, q)
                      : undefined}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserHeader({ user, rank, marathonStartedAt }: {
  user: QuestGridUser
  rank?: number
  marathonStartedAt: string | null
}) {
  const newUser = isNew(user.registeredAt)
  const borderColor = user.isCompleted ? '#3D6B4F' : newUser ? '#C4714A' : '#d4cfc5'
  const nameColor = user.isCompleted ? '#3D6B4F' : newUser ? '#C4714A' : '#1A1A1A'
  const elapsed = user.isCompleted && user.completedAt && marathonStartedAt
    ? formatElapsed(user.completedAt, marathonStartedAt)
    : null

  return (
    <div
      className="font-mono"
      style={{ background: '#FFFDF9', border: `1.5px solid ${borderColor}`, borderRadius: 8, padding: '5px 4px', textAlign: 'center', marginBottom: 2 }}
    >
      {rank !== undefined && <div style={{ fontSize: 9, color: '#C4714A', fontWeight: 700 }}>{rank}위</div>}
      <div style={{ fontSize: 11, fontWeight: 600, color: nameColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.nickname}
      </div>
      <div style={{ fontSize: 9, color: '#7A9E87' }}>{user.completedSteps.length}/10</div>
      {elapsed && <div style={{ fontSize: 8, color: '#3D6B4F', marginTop: 1 }}>{elapsed}</div>}
    </div>
  )
}

function QuestCell({ step, user, onClick }: { step: number; user: QuestGridUser; onClick?: () => void }) {
  const completed = user.completedSteps.includes(step)
  const purchased = user.purchasedSteps.includes(step)

  const base: React.CSSProperties = {
    width: '100%', height: '100%', minHeight: 24, borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
    cursor: onClick ? 'pointer' : 'default',
  }

  if (completed) {
    return <div style={{ ...base, background: '#3D6B4F', color: '#FFFDF9' }}>✓</div>
  }
  if (purchased) {
    return (
      <div
        style={{ ...base, background: '#C4714A', color: '#FFFDF9', animation: 'pulse 1s step-end infinite' }}
        onClick={onClick}
        title={onClick ? '클릭해서 강제 완료' : undefined}
      >
        ▶
      </div>
    )
  }
  return (
    <div
      style={{ ...base, background: '#F5F0E8', border: '1px solid #d4cfc5' }}
      onClick={onClick}
      title={onClick ? '클릭해서 강제 완료' : undefined}
    />
  )
}
