import { useEffect, useState } from 'react'
import type { QuestGridUser } from './QuestGrid'

interface Props {
  password: string
  onBack: () => void
  serverUrl: string
}

function truncate(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function AirdropView({ password, onBack, serverUrl }: Props) {
  const [users, setUsers] = useState<QuestGridUser[]>([])
  const [selected, setSelected] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch(`${serverUrl}/v1/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
      .then((r) => r.json())
      .then((data: { ok: boolean; users: QuestGridUser[] }) => {
        if (data.ok && data.users.length > 0) {
          setUsers(data.users)
          setSelected(data.users[0].walletAddress)
        }
      })
      .catch(console.warn)
  }, [serverUrl, password])

  const handleAirdrop = async () => {
    if (!selected) return
    setStatus('loading')
    setTxHash('')
    setErrorMsg('')
    try {
      const res = await fetch(`${serverUrl}/v1/admin/airdrop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, walletAddress: selected }),
      })
      const data = await res.json() as { ok: boolean; txHash?: string; error?: string }
      if (data.ok) {
        setStatus('done')
        setTxHash(data.txHash ?? '')
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? '오류 발생')
      }
    } catch {
      setStatus('error')
      setErrorMsg('네트워크 오류')
    }
  }

  return (
    <div className="w-screen h-screen bg-beige flex flex-col items-center justify-center" style={{ cursor: 'default' }}>
      <div style={{ background: '#FFFDF9', border: '1px solid rgba(122,158,135,0.3)', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: 384 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onBack}
            className="font-mono text-sm text-sage"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ←
          </button>
          <h1 className="font-mono font-bold text-xl text-forest">USDC 에어드랍</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="font-mono text-xs text-sage">유저 선택</label>
          <select
            value={selected}
            onChange={(e) => { setSelected(e.target.value); setStatus('idle') }}
            style={{ fontFamily: 'monospace', fontSize: 13, border: '1px solid rgba(122,158,135,0.3)', borderRadius: 8, padding: '0.5rem 0.75rem', background: '#F5F0E8', outline: 'none', cursor: 'pointer' }}
          >
            {users.map((u) => (
              <option key={u.walletAddress} value={u.walletAddress}>
                {u.nickname} ({truncate(u.walletAddress)})
              </option>
            ))}
          </select>
        </div>

        <div className="font-mono text-sm text-forest" style={{ background: '#F5F0E8', borderRadius: 8, padding: '0.75rem 1rem' }}>
          전송 금액: <strong>20 USDC</strong>
        </div>

        {status === 'done' && txHash && (
          <p className="font-mono text-xs text-forest" style={{ wordBreak: 'break-all' }}>
            완료: {txHash}
          </p>
        )}
        {status === 'error' && (
          <p className="font-mono text-xs text-terracotta">{errorMsg}</p>
        )}

        <button
          onClick={handleAirdrop}
          disabled={!selected || status === 'loading'}
          style={{
            fontFamily: 'monospace', fontSize: 14, background: '#3D6B4F', color: '#FFFDF9',
            borderRadius: 8, padding: '0.5rem 1rem', border: 'none',
            cursor: !selected || status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: !selected || status === 'loading' ? 0.6 : 1,
          }}
        >
          {status === 'loading' ? '전송 중...' : '20 USDC 전송'}
        </button>
      </div>
    </div>
  )
}
