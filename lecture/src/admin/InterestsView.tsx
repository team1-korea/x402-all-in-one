import { useEffect, useState } from 'react'

interface InterestEntry {
  wallet_address: string
  tags: { nickname: string; interest: string }[]
}

interface Props {
  password: string
  onBack: () => void
  serverUrl: string
}

export default function InterestsView({ password, onBack, serverUrl }: Props) {
  const [entries, setEntries] = useState<InterestEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${serverUrl}/v1/admin/interests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
      .then((r) => r.json())
      .then((data: { ok: boolean; entries?: InterestEntry[]; error?: string }) => {
        if (data.ok) setEntries(data.entries ?? [])
        else setError(data.error ?? '불러오기 실패')
      })
      .catch(() => setError('서버에 연결할 수 없습니다'))
      .finally(() => setLoading(false))
  }, [password, serverUrl])

  const allTags = entries.flatMap((e) => e.tags)

  const grouped = allTags.reduce<Record<string, string[]>>((acc, { nickname, interest }) => {
    if (!acc[nickname]) acc[nickname] = []
    acc[nickname].push(interest)
    return acc
  }, {})

  const handleCopy = () => {
    const text = Object.entries(grouped)
      .map(([nickname, interests]) => `${nickname}: ${interests.join(', ')}`)
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="w-screen h-screen bg-beige flex flex-col" style={{ cursor: 'default', padding: '2rem 3rem' }}>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          style={{ fontFamily: 'monospace', fontSize: 12, color: '#7A9E87', border: '1px solid rgba(122,158,135,0.3)', borderRadius: 8, padding: '0.4rem 0.75rem', background: 'transparent', cursor: 'pointer' }}
        >
          ← 뒤로
        </button>
        <h1 className="font-mono font-bold text-xl text-forest">관심사 목록</h1>
        <span className="font-mono text-xs text-sage">{allTags.length}개 항목 · {Object.keys(grouped).length}명</span>
        <button
          onClick={handleCopy}
          style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 12, background: '#3D6B4F', color: '#FFFDF9', borderRadius: 8, padding: '0.4rem 0.75rem', border: 'none', cursor: 'pointer' }}
        >
          복사
        </button>
      </div>

      {loading && <p className="font-mono text-sm text-sage animate-pulse">불러오는 중...</p>}
      {error && <p className="font-mono text-sm text-terracotta">{error}</p>}

      {!loading && !error && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.entries(grouped).map(([nickname, interests]) => (
            <div
              key={nickname}
              style={{ background: '#FFFDF9', border: '1px solid rgba(122,158,135,0.2)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', gap: '1rem', alignItems: 'baseline' }}
            >
              <span className="font-mono font-semibold text-forest" style={{ fontSize: 13, minWidth: 120 }}>{nickname}</span>
              <span className="font-mono text-dark/70" style={{ fontSize: 12 }}>{interests.join(' · ')}</span>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <p className="font-mono text-sm text-sage/50">아직 수집된 관심사가 없습니다</p>
          )}
        </div>
      )}
    </div>
  )
}
