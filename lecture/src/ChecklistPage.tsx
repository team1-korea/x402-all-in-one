const items = [
  {
    label: 'VSCode 설치',
    sub: 'code.visualstudio.com에서 다운로드',
    type: 'check' as const,
  },
  {
    label: 'Claude 구독 확인',
    sub: '구독 중이라면 Claude Code CLI가 필요합니다',
    type: 'branch' as const,
    yes: 'npx @anthropic-ai/claude-code 설치 필요',
    no: '스태프에게 알려주세요 🙋',
  },
]

export default function ChecklistPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F0E8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        fontFamily: 'sans-serif',
      }}
    >
      <p style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#7A9E87', marginBottom: 16 }}>
        Pre-Meetup Checklist
      </p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 48, color: '#1A1A1A', marginBottom: 48, textAlign: 'center' }}>
        시작 전 확인사항
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 540 }}>
        {/* VSCode */}
        <div style={{ background: '#FFFDF9', border: '1.5px solid rgba(122,158,135,0.25)', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>VSCode 설치</p>
              <p style={{ fontSize: 13, color: '#7A9E87', margin: '4px 0 0' }}>code.visualstudio.com에서 다운로드</p>
            </div>
          </div>
        </div>

        {/* Claude 구독 */}
        <div style={{ background: '#FFFDF9', border: '1.5px solid rgba(122,158,135,0.25)', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ fontSize: 22, marginTop: 2 }}>🤖</span>
            <div style={{ width: '100%' }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: '0 0 14px' }}>Claude 구독 확인</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'rgba(61,107,79,0.07)', border: '1px solid rgba(61,107,79,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#3D6B4F', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>구독 중이라면</p>
                  <p style={{ fontSize: 14, color: '#1A1A1A', margin: 0 }}>Claude Code CLI 설치가 필요합니다</p>
                  <code style={{ fontSize: 12, color: '#3D6B4F', background: 'rgba(61,107,79,0.1)', padding: '3px 8px', borderRadius: 5, display: 'inline-block', marginTop: 6 }}>
                    npm install -g @anthropic-ai/claude-code
                  </code>
                </div>
                <div style={{ background: 'rgba(196,113,74,0.07)', border: '1px solid rgba(196,113,74,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#C4714A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>구독 안 하셨다면</p>
                  <p style={{ fontSize: 14, color: '#1A1A1A', margin: 0 }}>스태프에게 알려주세요 🙋</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
