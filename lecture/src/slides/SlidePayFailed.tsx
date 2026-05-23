interface Props { animKey: number }

const SlidePayFailed = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '44vw', height: '44vw', top: '-10%', right: '-8%', opacity: 0.05, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-3xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>
        08 · Expected
      </p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-3" style={{ animationDelay: '0.2s' }}>
        실패하셨죠?
      </h2>
      <p className="fade-in-stagger font-sans font-light text-xl text-sage mb-10" style={{ animationDelay: '0.4s' }}>
        당연합니다 — 의도된 실패입니다
      </p>

      <div className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-5 mb-6 font-mono text-sm text-[#d4ede0] leading-relaxed" style={{ animationDelay: '0.6s' }}>
        <span className="text-terracotta">⛔</span>
        {' '}x402-pay 스킬에 채워지지 않은 TODO가 있습니다.{'\n'}
        {'   '}결제를 진행하기 전에 아래 항목을 직접 채워주세요.
      </div>

      <div className="fade-in-stagger w-full flex flex-col gap-3" style={{ animationDelay: '0.9s' }}>
        <div className="bg-cream/70 border border-sage/15 rounded-xl px-7 py-5">
          <p className="font-sans text-base text-dark/70 leading-relaxed">
            x402-pay 스킬은 실행 시 <code className="font-mono text-sm bg-terracotta/10 text-terracotta px-2 py-0.5 rounded">[TODO</code> 문자열을 먼저 검사합니다.
            <br />
            하나라도 남아있으면 <strong className="text-dark font-medium">결제를 거부</strong>하고 위 메시지를 돌려줍니다.
          </p>
        </div>
        <div className="bg-forest/8 border border-forest/20 rounded-xl px-7 py-5">
          <p className="font-sans text-base text-forest font-medium">
            다음 단계 → SKILL.md를 열어 TODO 4개를 채웁니다
          </p>
        </div>
      </div>
    </div>
  </div>
)

export default SlidePayFailed
