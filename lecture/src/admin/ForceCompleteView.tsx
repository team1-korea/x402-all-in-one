import { useEffect, useState, useCallback } from 'react'
import QuestGrid, { type QuestGridUser } from './QuestGrid'

interface Props {
  password: string
  onBack: () => void
  serverUrl: string
}

interface AdminUsersResponse {
  ok: boolean
  marathonStartedAt: string | null
  users: QuestGridUser[]
}

export default function ForceCompleteView({ password, onBack, serverUrl }: Props) {
  const [users, setUsers] = useState<QuestGridUser[]>([])
  const [marathonStartedAt, setMarathonStartedAt] = useState<string | null>(null)
  const [pending, setPending] = useState<{ walletAddress: string; step: number } | null>(null)
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [actionMessage, setActionMessage] = useState('')

  const fetchUsers = useCallback(() => {
    fetch(`${serverUrl}/v1/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
      .then((r) => r.json())
      .then((data: AdminUsersResponse) => {
        if (data.ok) {
          setUsers(data.users)
          setMarathonStartedAt(data.marathonStartedAt)
        }
      })
      .catch(console.warn)
  }, [serverUrl, password])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleConfirm = async () => {
    if (!pending) return
    setActionStatus('loading')
    try {
      const res = await fetch(`${serverUrl}/v1/admin/force-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, walletAddress: pending.walletAddress, step: pending.step }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (data.ok) {
        setActionStatus('done')
        setActionMessage('강제 완료 처리되었습니다')
        fetchUsers()
      } else {
        setActionStatus('error')
        setActionMessage(data.error ?? '오류 발생')
      }
    } catch {
      setActionStatus('error')
      setActionMessage('네트워크 오류')
    }
    setPending(null)
  }

  const pendingUser = pending ? users.find((u) => u.walletAddress === pending.walletAddress) : null

  return (
    <div className="w-screen h-screen bg-beige flex flex-col" style={{ padding: '2rem 3rem', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
        <button
          onClick={onBack}
          className="font-mono text-sm text-sage"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← 뒤로
        </button>
        <h1 className="font-mono font-bold text-xl text-forest">퀘스트 강제 클리어</h1>
        {actionStatus !== 'idle' && (
          <span className={`font-mono text-xs ${actionStatus === 'done' ? 'text-forest' : actionStatus === 'error' ? 'text-terracotta' : 'text-sage'}`}>
            {actionStatus === 'loading' ? '처리 중...' : actionMessage}
          </span>
        )}
      </div>
      <p className="font-mono text-xs text-sage" style={{ marginBottom: '1rem' }}>
        완료되지 않은 셀(▶ 또는 빈 칸)을 클릭해서 강제 완료 처리하세요
      </p>

      {users.length > 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <QuestGrid
            users={users}
            marathonStartedAt={marathonStartedAt}
            onCellClick={(walletAddress, step) => setPending({ walletAddress, step })}
          />
        </div>
      ) : (
        <p className="font-mono text-sm text-sage animate-pulse">로딩 중...</p>
      )}

      {pending && pendingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#FFFDF9', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: 288 }}>
            <p className="font-mono text-sm text-forest">
              <strong>{pendingUser.nickname}</strong>의 Q{pending.step}을 강제 완료 처리하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPending(null)}
                style={{ fontFamily: 'monospace', fontSize: 12, color: '#7A9E87', border: '1px solid rgba(122,158,135,0.3)', borderRadius: 8, padding: '0.5rem 1rem', background: 'transparent', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFFDF9', background: '#3D6B4F', borderRadius: 8, padding: '0.5rem 1rem', border: 'none', cursor: 'pointer' }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
