interface Props { animKey: number }

const steps = [
  {
    num: '01',
    title: '별명 입력',
    detail: null,
    desc: 'Claude가 닉네임을 물어봅니다',
  },
  {
    num: '02',
    title: '지갑 생성 & 저장',
    detail: 'POST /v1/register',
    desc: '.x402-wallet.json에 저장',
  },
  {
    num: '03',
    title: '100 USDC 수신',
    detail: null,
    desc: '등록 즉시 에어드랍 — 퀘스트 비용 선지급',
  },
  {
    num: '04',
    title: '제일 쉬운 퀘스트 구매',
    detail: 'GET → 402 → X-PAYMENT → questUrl',
    desc: 'x402 결제 흐름 전체를 Claude가 실행',
  },
]

const Slide10Test = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '42vw', height: '42vw', bottom: '-10%', right: '-8%', opacity: 0.05, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-3xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>07 · Lab — 테스트</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-6" style={{ animationDelay: '0.2s' }}>클로드, 첫 결제 시켜보기</h2>

      <pre className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-5 font-mono text-2xl text-[#d4ede0] text-center mb-6" style={{ animationDelay: '0.4s' }}>
        /x402-quest
      </pre>

      <div className="fade-in-stagger flex flex-col gap-2.5 w-full" style={{ animationDelay: '0.7s' }}>
        {steps.map(({ num, title, detail, desc }) => (
          <div key={num} className="flex items-center gap-5 bg-cream/70 border border-sage/15 rounded-xl px-6 py-4">
            <span className="font-mono text-lg text-sage/35 font-bold shrink-0 w-7">{num}</span>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-base text-dark font-medium leading-tight">{title}</p>
              {detail && (
                <code className="font-mono text-xs text-terracotta bg-terracotta/8 border border-terracotta/20 px-2 py-0.5 rounded mt-1 inline-block">
                  {detail}
                </code>
              )}
            </div>
            <p className="font-sans text-sm text-sage text-right shrink-0 max-w-[200px] leading-snug">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Slide10Test
