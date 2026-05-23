import { Fragment, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props { animKey: number }

interface RowDef {
  left: string
  right: string
  highlight: boolean
  isPre?: boolean
  hasPreview?: boolean
}

const preRows: RowDef[] = [
  { left: '책 구매욕구', right: '구매 필요 확인', highlight: false, isPre: true },
  { left: '온라인 서점 찾기', right: 'llms.txt 확인', highlight: false, isPre: true, hasPreview: true },
]

const llmsTxtContent = `# x402 Avalanche L1 — 빌더 밋업

> TONE 토큰(EIP-3009)으로 결제합니다.
> API 키 없음, 가입 없음.

## 네트워크 정보

Chain ID    : 402
네트워크    : Avalanche APIX L1 Testnet
Facilitator : https://pay.abcfe.net
TONE Token  : 0x6ac929821e85970910f5dbafaee81823d71b17f3

## 동작 방식

결제 없이 유료 엔드포인트를 호출하면
서버는 HTTP 402와 결제 요건을 반환합니다.
에이전트가 X-PAYMENT 헤더에 서명된 결제를 담아
재요청하면 퀘스트 URL을 반환합니다.

## 퀘스트 목록

| # | 퀘스트                      | 가격   |
|---|-----------------------------|--------|
| 1 | 드래그앤드롭 — x402 흐름    | 1 TONE |
| 2 | OX — Claude 스킬            | 1 TONE |
| 3 | OX — x402 프로토콜          | 1 TONE |
| 4 | 게임 — 합의를 방해하라      | 1 TONE |
| 5 | 객관식 — Claude 모델        | 1 TONE |
`

const x402Rows: RowDef[] = [
  { left: '"이 책 주세요"', right: 'GET /ebook/123 (결제 없이 첫 호출)', highlight: false },
  { left: '"결제해주세요"', right: 'HTTP 402 + chain / amount / payTo', highlight: true },
  { left: '가격 + 결제 수단', right: 'EIP-3009 서명 → X-PAYMENT 헤더', highlight: false },
  { left: '카드 꽂기', right: 'X-PAYMENT 헤더 담아 재요청', highlight: false },
  { left: '카드사 처리', right: 'Facilitator: 서명 검증 + 온체인 정산', highlight: false },
  { left: '책 수령!', right: '200 OK — 전자책 URL 반환', highlight: false },
]

const allRows = [...preRows, ...x402Rows]

const Slide08Comparison = ({ animKey }: Props) => {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div className="slide bg-beige content-z-index">
      <div className="ambient-shape bg-forest" style={{ width: '40vw', height: '40vw', top: '-8%', left: '-5%', opacity: 0.04, animationDelay: '-7s' }} />
      <div key={animKey} className="flex flex-col items-center w-full max-w-5xl content-z-index">
        <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>08 · Theory — x402 대응표</p>
        <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-10" style={{ animationDelay: '0.2s' }}>x402 = 전자책 구매 흐름</h2>
        <div
          className="fade-in-stagger w-full"
          style={{ display: 'grid', gridTemplateColumns: '1fr 2.5rem 1fr 4rem', animationDelay: '0.5s' }}
        >
          {/* Headers */}
          <div className="bg-forest/10 border border-forest/20 px-5 py-3 text-forest font-mono text-sm tracking-widest text-center rounded-tl-lg">서점 비유</div>
          <div />
          <div className="bg-terracotta/10 border border-terracotta/20 px-5 py-3 text-terracotta font-mono text-sm tracking-widest text-center rounded-tr-lg">x402</div>
          <div />

          {allRows.map((row, i) => {
            const isX402 = !row.isPre
            const x402Index = i - preRows.length
            const isFirst = x402Index === 0
            const isLast = x402Index === x402Rows.length - 1

            return (
              <Fragment key={row.left}>
                <div className={`border px-5 py-3 text-base flex items-center rounded-l-md my-0.5 ${
                  row.isPre
                    ? 'bg-cream/30 border-sage/10 text-dark/35'
                    : 'bg-cream/50 border-sage/15 text-dark/70'
                }`}>
                  {row.left}
                </div>
                <div className={`flex items-center justify-center text-base ${row.isPre ? 'text-sage/30' : 'text-terracotta'}`}>↔</div>
                <div
                  className={`border px-5 py-3 text-base flex items-center rounded-r-md my-0.5 gap-2 ${
                    row.isPre
                      ? 'bg-cream/30 border-sage/10 text-dark/35'
                      : row.highlight
                        ? 'bg-terracotta/10 border-terracotta/25 text-terracotta font-medium'
                        : 'bg-cream/50 border-sage/15 text-forest/80'
                  } ${row.hasPreview ? 'cursor-pointer hover:bg-sage/10 hover:border-sage/30 transition-all duration-150' : ''}`}
                  onClick={row.hasPreview ? () => setPreviewOpen(true) : undefined}
                >
                  {row.right}
                  {row.hasPreview && <span className="text-xs text-sage/50 ml-auto shrink-0">파일 보기 →</span>}
                </div>
                {isX402 ? (
                  <div className={`ml-2 my-0.5 border-r-2 border-terracotta/40 relative ${
                    isFirst ? 'border-t-2 rounded-tr-md' : ''
                  } ${
                    isLast ? 'border-b-2 rounded-br-md' : ''
                  }`}>
                    {isFirst && (
                      <span className="absolute left-2 top-1.5 text-xs font-mono text-terracotta bg-terracotta/10 border border-terracotta/25 px-1.5 py-0.5 rounded whitespace-nowrap">
                        x402
                      </span>
                    )}
                  </div>
                ) : (
                  <div />
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      {previewOpen && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(30, 40, 30, 0.72)',
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
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#7A9E87', fontWeight: 600 }}>llms.txt</span>
                <span style={{ fontFamily: 'sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '4px' }}>AI 에이전트용 서비스 설명서</span>
              </div>
              <button
                style={{ fontFamily: 'sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setPreviewOpen(false)}
              >
                닫기 ✕
              </button>
            </div>
            <pre style={{ overflowY: 'auto', padding: '20px 24px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13px', lineHeight: 1.7, color: 'rgba(187,247,208,0.8)', whiteSpace: 'pre-wrap', margin: 0 }}>
              {llmsTxtContent}
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

export default Slide08Comparison
