import { useState } from 'react'
import { createPortal } from 'react-dom'

interface Props { animKey: number; step?: number }

type Hint = {
  num: string
  iphone: string
  hole: string
  hint: string
  answer: string
  hasPreview?: boolean
}

const example402 = `HTTP/1.1 402 Payment Required

{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:402",
    "asset": "0x65e1ec07cdc00f18e11dd0370c6158029f61721e",
    "amount": "10000000",
    "payTo": "0x7486fE46d82541ac4ae3b09b9a7061b8123A61Ba",
    "maxTimeoutSeconds": 60,
    "resource": "https://x402.abcfe.net/v1/quest/product-a/2",
    "extra": {
      "assetTransferMethod": "eip3009",
      "name": "USD Coin",
      "version": "2"
    }
  }],
  "error": "결제가 필요합니다",
  "difficulty": "easy"
}`

const hints: Hint[] = [
  {
    num: '①',
    iphone: '카드사',
    hole: '누가 결제를 검증해?',
    hint: '서버 대신 결제를 검증·정산해주는 외부 서버',
    answer: 'https://pay.abcfe.net',
  },
  {
    num: '②',
    iphone: '"돈 내야 해"',
    hole: '서버가 몇 번 응답을 돌려줘?',
    hint: '결제가 필요할 때 HTTP가 돌려주는 상태 코드',
    answer: '402',
    hasPreview: true,
  },
  {
    num: '③',
    iphone: '입금 계좌번호',
    hole: '받는 지갑 주소(to)는 어디서 가져와?',
    hint: '402 응답 어딘가에 있어 — 예시 눌러봐',
    answer: 'accepts[0].payTo',
    hasPreview: true,
  },
  {
    num: '④',
    iphone: '카드 내밀기',
    hole: '재요청할 때 추가하는 헤더 이름은?',
    hint: '결제 서명을 실어 보내는 HTTP 헤더',
    answer: 'X-PAYMENT',
  },
]

const Slide09Hints = ({ animKey, step = 0 }: Props) => {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div className="slide bg-beige content-z-index">
      <div className="ambient-shape bg-terracotta" style={{ width: '35vw', height: '35vw', top: '-5%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
      <div key={animKey} className="flex flex-col items-center w-full max-w-5xl content-z-index">
        <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>07 · Lab</p>
        <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-3" style={{ animationDelay: '0.2s' }}>구멍 채우기</h2>
        <p className="fade-in-stagger font-sans font-light text-base text-sage mb-6" style={{ animationDelay: '0.4s' }}>
          x402-pay/SKILL.md 열고 [TODO] 4개를 자연어로 채우세요
        </p>
        <div className="flex flex-col gap-3 w-full">
          {hints.map(({ num, iphone, hole, hint, answer, hasPreview }, i) => {
            const revealed = step > i
            return (
              <div
                key={num}
                className={`w-full bg-cream/60 rounded-xl border px-6 py-4 transition-all duration-200 ${
                  hasPreview && revealed
                    ? 'border-terracotta/30 cursor-pointer hover:bg-terracotta/5 hover:border-terracotta/50'
                    : 'border-sage/15'
                }`}
                style={{
                  opacity: revealed ? 1 : 0.35,
                  filter: revealed ? 'none' : 'blur(3px)',
                  transition: 'opacity 0.5s ease, filter 0.5s ease',
                }}
                onClick={hasPreview && revealed ? () => setPreviewOpen(true) : undefined}
              >
                <div className="flex items-start gap-5">
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                    <span className="font-mono text-terracotta text-sm font-semibold">{num}</span>
                    <span className="font-mono text-xs text-sage bg-sage/10 px-2 py-0.5 rounded whitespace-nowrap">{iphone}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-base text-dark font-medium mb-0.5">{hole}</p>
                    <p className="font-sans text-sm text-dark/55 mb-2">{hint}</p>
                    <code className="font-mono text-sm text-terracotta bg-terracotta/8 border border-terracotta/20 px-3 py-1 rounded">
                      {answer}
                    </code>
                  </div>
                  {hasPreview && revealed && (
                    <span className="font-sans text-xs text-terracotta/50 shrink-0 pt-1">예시 보기 →</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="fade-in-stagger w-full mt-4 bg-forest/10 border border-forest/20 rounded-xl px-6 py-3 font-sans text-sm text-forest" style={{ animationDelay: '1.0s' }}>
          정확하지 않아도 됩니다 — 비슷한 의미면 Claude가 알아서 해석합니다
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
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)', maxWidth: '640px',
              width: 'calc(100% - 48px)', maxHeight: '78vh', display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#C4714A', fontWeight: 600 }}>402 Payment Required</span>
                <span style={{ fontFamily: 'sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '4px' }}>예시 응답</span>
              </div>
              <button
                style={{ fontFamily: 'sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setPreviewOpen(false)}
              >
                닫기 ✕
              </button>
            </div>
            <pre style={{ overflowY: 'auto', padding: '20px 24px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13px', lineHeight: 1.7, color: 'rgba(187,247,208,0.85)', whiteSpace: 'pre-wrap', margin: 0 }}>
              {example402}
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

export default Slide09Hints
