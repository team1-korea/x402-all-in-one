import { useEffect, useState } from 'react'
import ForceCompleteView from './admin/ForceCompleteView'
import AirdropView from './admin/AirdropView'
import InterestsView from './admin/InterestsView'

type View = 'login' | 'home' | 'force-complete' | 'airdrop' | 'interests'

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'https://x402.abcfe.net'

export default function AdminPage() {
  const [view, setView] = useState<View>('login')
  const [password, setPassword] = useState('')
  const [input, setInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [resetConfirm, setResetConfirm] = useState<0 | 1 | 2>(0)
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [marathonStarted, setMarathonStarted] = useState<boolean | null>(null)
  const [marathonLoading, setMarathonLoading] = useState(false)

  useEffect(() => {
    if (view !== 'home') return
    fetch(`${SERVER_URL}/v1/marathon/status`)
      .then((r) => r.json())
      .then((d: { started: boolean }) => setMarathonStarted(d.started))
      .catch(() => {})
  }, [view])

  const handleLogin = async () => {
    setLoginError('')
    try {
      const res = await fetch(`${SERVER_URL}/v1/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: input }),
      })
      const data = await res.json() as { ok: boolean }
      if (data.ok) {
        setPassword(input)
        setView('home')
      } else {
        setLoginError('비밀번호가 올바르지 않습니다')
      }
    } catch {
      setLoginError('서버에 연결할 수 없습니다')
    }
  }

  const handleMarathon = async (action: 'start' | 'stop') => {
    setMarathonLoading(true)
    try {
      const res = await fetch(`${SERVER_URL}/v1/marathon/${action}`, { method: 'POST' })
      const data = await res.json() as { started: boolean }
      setMarathonStarted(data.started)
    } catch {}
    setMarathonLoading(false)
  }

  const handleReset = async () => {
    setResetStatus('loading')
    try {
      const res = await fetch(`${SERVER_URL}/v1/admin/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json() as { ok: boolean }
      setResetStatus(data.ok ? 'done' : 'error')
    } catch {
      setResetStatus('error')
    }
    setResetConfirm(0)
  }

  if (view === 'force-complete') {
    return <ForceCompleteView password={password} onBack={() => setView('home')} serverUrl={SERVER_URL} />
  }

  if (view === 'airdrop') {
    return <AirdropView password={password} onBack={() => setView('home')} serverUrl={SERVER_URL} />
  }

  if (view === 'interests') {
    return <InterestsView password={password} onBack={() => setView('home')} serverUrl={SERVER_URL} />
  }

  if (view === 'login') {
    return (
      <div className="w-screen h-screen bg-beige flex items-center justify-center" style={{ cursor: 'default' }}>
        <div style={{ background: '#FFFDF9', border: '1px solid rgba(122,158,135,0.3)', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: 320 }}>
          <h1 className="font-mono font-bold text-xl text-forest">Admin</h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호"
            style={{ fontFamily: 'monospace', fontSize: 14, border: '1px solid rgba(122,158,135,0.3)', borderRadius: 8, padding: '0.5rem 0.75rem', background: '#F5F0E8', outline: 'none', cursor: 'text' }}
          />
          {loginError && <p className="font-mono text-xs text-terracotta">{loginError}</p>}
          <button
            onClick={handleLogin}
            style={{ fontFamily: 'monospace', fontSize: 14, background: '#3D6B4F', color: '#FFFDF9', borderRadius: 8, padding: '0.5rem 1rem', border: 'none', cursor: 'pointer' }}
          >
            로그인
          </button>
        </div>
      </div>
    )
  }

  // home
  return (
    <div className="w-screen h-screen bg-beige flex flex-col items-center justify-center gap-8" style={{ cursor: 'default' }}>
      <h1 className="font-mono font-bold text-2xl text-forest">Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <NavCard
          title="퀘스트 강제 클리어"
          description="특정 유저의 퀘스트를 강제 완료 처리"
          onClick={() => setView('force-complete')}
        />
        <NavCard
          title="USDC 에어드랍"
          description="유저에게 20 USDC 전송"
          onClick={() => setView('airdrop')}
        />
        <NavCard
          title="관심사 조회"
          description="퀘스트에서 수집된 관심사 목록"
          onClick={() => setView('interests')}
        />
        <div style={{ background: '#FFFDF9', border: '1px solid rgba(122,158,135,0.3)', borderRadius: 16, padding: '1.5rem', width: 200, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h2 className="font-mono font-bold text-base text-forest">마라톤</h2>
          <p className="font-mono text-xs text-sage">
            {marathonStarted === null ? '상태 확인 중...' : marathonStarted ? '진행 중' : '대기 중'}
          </p>
          {marathonStarted
            ? (
              <button
                onClick={() => handleMarathon('stop')}
                disabled={marathonLoading}
                style={{ fontFamily: 'monospace', fontSize: 12, background: '#C4714A', color: '#FFFDF9', borderRadius: 8, padding: '0.5rem 0.75rem', border: 'none', cursor: 'pointer', opacity: marathonLoading ? 0.6 : 1 }}
              >
                {marathonLoading ? '처리 중...' : '중지'}
              </button>
            )
            : (
              <button
                onClick={() => handleMarathon('start')}
                disabled={marathonLoading}
                style={{ fontFamily: 'monospace', fontSize: 12, background: '#3D6B4F', color: '#FFFDF9', borderRadius: 8, padding: '0.5rem 0.75rem', border: 'none', cursor: 'pointer', opacity: marathonLoading ? 0.6 : 1 }}
              >
                {marathonLoading ? '처리 중...' : '시작'}
              </button>
            )
          }
        </div>
        <div style={{ background: '#FFFDF9', border: '1px solid rgba(196,113,74,0.3)', borderRadius: 16, padding: '1.5rem', width: 200, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h2 className="font-mono font-bold text-base text-terracotta">DB 초기화</h2>
          <p className="font-mono text-xs text-sage">모든 데이터를 삭제합니다</p>
          {resetStatus === 'done' && <p className="font-mono text-xs text-forest">완료되었습니다</p>}
          {resetStatus === 'error' && <p className="font-mono text-xs text-terracotta">오류가 발생했습니다</p>}
          <button
            onClick={() => { setResetStatus('idle'); setResetConfirm(1) }}
            style={{ fontFamily: 'monospace', fontSize: 12, background: '#C4714A', color: '#FFFDF9', borderRadius: 8, padding: '0.5rem 0.75rem', border: 'none', cursor: 'pointer' }}
          >
            초기화
          </button>
        </div>
      </div>

      {resetConfirm === 1 && (
        <ConfirmModal
          message="정말 DB를 초기화하시겠습니까?"
          onConfirm={() => setResetConfirm(2)}
          onCancel={() => setResetConfirm(0)}
        />
      )}
      {resetConfirm === 2 && (
        <ConfirmModal
          message="되돌릴 수 없습니다. 계속할까요?"
          confirmLabel="초기화"
          danger
          loading={resetStatus === 'loading'}
          onConfirm={handleReset}
          onCancel={() => setResetConfirm(0)}
        />
      )}
    </div>
  )
}

function NavCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: '#FFFDF9', border: '1px solid rgba(122,158,135,0.3)', borderRadius: 16, padding: '1.5rem', width: 200, display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', cursor: 'pointer' }}
    >
      <h2 className="font-mono font-bold text-base text-forest">{title}</h2>
      <p className="font-mono text-xs text-sage">{description}</p>
    </button>
  )
}

function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = '확인', danger = false, loading = false }: {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#FFFDF9', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: 288 }}>
        <p className="font-mono text-sm text-forest">{message}</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ fontFamily: 'monospace', fontSize: 12, color: '#7A9E87', border: '1px solid rgba(122,158,135,0.3)', borderRadius: 8, padding: '0.5rem 1rem', background: 'transparent', cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFFDF9', background: danger ? '#C4714A' : '#3D6B4F', borderRadius: 8, padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '처리 중...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
