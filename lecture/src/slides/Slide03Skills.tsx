import { useState } from 'react'
import { createPortal } from 'react-dom'

interface Props { animKey: number }

const skills = [
  { slash: '/commit', desc: 'staged 변경사항을 분석해 conventional commit 메시지 자동 작성' },
  { slash: '/review', desc: 'PR 전체 diff를 읽고 버그·보안·품질 이슈 리포트', hasPreview: true },
  { slash: '/ship',   desc: '테스트 → 빌드 → PR 생성까지 한 번에' },
]

const reviewMarkdown = `# ── 이 파일이 /review 를 만듭니다 ──

name: review          ← /review 명령어 등록
triggers:
  - review this pr    ← 이 말을 들으면 자동 실행
  - code review


# ── 아래가 Claude에게 보내는 지시문 ──

/review 를 실행하면 Claude는 아래를 따릅니다:

1. git diff origin/main 으로 변경사항 읽기
2. 버그·보안 이슈 찾기
3. 고칠 수 있으면 바로 고치고,
   판단이 필요하면 물어보기
`

const Slide03Skills = ({ animKey }: Props) => {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div className="slide bg-beige content-z-index">
      <div className="ambient-shape bg-forest" style={{ width: '45vw', height: '45vw', top: '-5%', right: '-8%', opacity: 0.04, animationDelay: '-6s' }} />
      <div key={animKey} className="flex flex-col items-center w-full max-w-4xl content-z-index">
        <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>02 · Claude Skills</p>
        <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-4" style={{ animationDelay: '0.2s' }}>Claude 스킬이란?</h2>
        <p className="fade-in-stagger font-sans text-xl text-dark/60 mb-8" style={{ animationDelay: '0.4s' }}>
          <code className="bg-forest/10 px-2 py-0.5 rounded text-forest font-mono">/</code>
          {' '}를 치면 나오는 슬래시 명령어 — <strong className="text-dark font-medium">.md 파일 하나</strong>로 만들어집니다
        </p>
        <div className="fade-in-stagger w-full flex flex-col gap-3 mb-7" style={{ animationDelay: '0.7s' }}>
          {skills.map(({ slash, desc, hasPreview }) => (
            <div
              key={slash}
              className={`flex items-center gap-5 bg-cream/70 border rounded-xl px-6 py-4 transition-all duration-200 ${
                hasPreview
                  ? 'border-terracotta/40 cursor-pointer hover:bg-terracotta/5 hover:border-terracotta/60 hover:shadow-sm'
                  : 'border-forest/15'
              }`}
              onClick={hasPreview ? () => setPreviewOpen(true) : undefined}
            >
              <code className="font-mono text-lg text-terracotta font-semibold w-24 shrink-0">{slash}</code>
              <span className="font-sans text-base text-dark/70 flex-1">{desc}</span>
              {hasPreview && (
                <span className="font-sans text-xs text-terracotta/60 shrink-0">클릭하면 .md 파일 보기 →</span>
              )}
            </div>
          ))}
        </div>
        <div className="fade-in-stagger w-full bg-forest/8 border border-forest/20 rounded-xl px-7 py-4 font-sans text-base text-dark/60" style={{ animationDelay: '1.0s' }}>
          코드가 아닙니다 — Claude에게 보내는 <strong className="text-forest font-medium">자연어 지시문</strong>입니다
        </div>
      </div>

      {previewOpen && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(30, 40, 30, 0.72)',
            cursor: 'auto',
          }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            style={{
              position: 'relative', background: '#1e2a1e', borderRadius: '1rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)', maxWidth: '680px',
              width: 'calc(100% - 48px)', maxHeight: '78vh', display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#C4714A', fontWeight: 600 }}>review/SKILL.md</span>
                <span style={{ fontFamily: 'sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '4px' }}>마크다운</span>
              </div>
              <button
                style={{ fontFamily: 'sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setPreviewOpen(false)}
              >
                닫기 ✕
              </button>
            </div>
            <pre style={{ overflowY: 'auto', padding: '20px 24px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13px', lineHeight: 1.7, color: 'rgba(187,247,208,0.8)', whiteSpace: 'pre-wrap', margin: 0 }}>
              {reviewMarkdown}
            </pre>
            <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <span style={{ fontFamily: 'sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>화면 아무 곳이나 클릭하면 닫힙니다</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Slide03Skills
