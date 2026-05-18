import { Fragment } from 'react'

interface Props { animKey: number }

const rows: [string, string, boolean][] = [
  ['"아이폰 13 주세요"', 'GET /v1/quest/{productId}/{step}', false],
  ['"결제해주세요"', 'HTTP 402 + accepts[0]', true],
  ['가격표 + 계좌번호', '체인 / 금액 / 수신 지갑', false],
  ['카드 꽂기', 'EIP-3009 서명 → X-PAYMENT 헤더', false],
  ['카드사 승인', 'facilitator: 검증 + 온체인 정산', false],
  ['아이폰 수령', '퀘스트 문제 응답', false],
]

const Slide07Comparison = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '40vw', height: '40vw', top: '-8%', left: '-5%', opacity: 0.04, animationDelay: '-7s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-5xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>06 · Theory — x402 대응표</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-10" style={{ animationDelay: '0.2s' }}>x402 = 아이폰 구매 흐름</h2>
      <div
        className="fade-in-stagger w-full"
        style={{ display: 'grid', gridTemplateColumns: '1fr 2.5rem 1fr', animationDelay: '0.5s' }}
      >
        <div className="bg-forest/10 border border-forest/20 px-5 py-3 text-forest font-mono text-sm tracking-widest text-center rounded-tl-lg">아이폰 비유</div>
        <div />
        <div className="bg-terracotta/10 border border-terracotta/20 px-5 py-3 text-terracotta font-mono text-sm tracking-widest text-center rounded-tr-lg">x402</div>
        {rows.map(([left, right, highlight]) => (
          <Fragment key={left}>
            <div className="bg-cream/50 border border-sage/15 px-5 py-3 text-dark/70 text-base flex items-center rounded-l-md my-0.5">{left}</div>
            <div className="flex items-center justify-center text-terracotta text-base">↔</div>
            <div className={`border px-5 py-3 text-base flex items-center rounded-r-md my-0.5 ${highlight ? 'bg-terracotta/10 border-terracotta/25 text-terracotta font-medium' : 'bg-cream/50 border-sage/15 text-forest/80'}`}>
              {right}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  </div>
)

export default Slide07Comparison
