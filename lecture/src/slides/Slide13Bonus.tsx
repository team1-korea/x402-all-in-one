interface Props { isActive: boolean; animKey: number }

const Slide13Bonus = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '40vw', height: '40vw', bottom: '-8%', right: '-5%', opacity: 0.04, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-3xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>08 · Bonus</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8 text-center" style={{ animationDelay: '0.2s' }}>
        내 서비스를<br /><span className="text-terracotta">x402</span>로 등록하기
      </h2>
      <div className="fade-in-stagger grid grid-cols-2 gap-5 w-full mb-6" style={{ animationDelay: '0.5s' }}>
        <div className="bg-cream/70 border border-forest/15 rounded-xl px-6 py-5">
          <p className="font-mono text-xs tracking-widest uppercase text-forest mb-3">오늘 쓴 코드 = 템플릿</p>
          <p className="font-sans text-sm text-dark/70 leading-relaxed mb-4">
            x402-server가 그대로<br />구현 레퍼런스가 됩니다
          </p>
          <pre className="bg-[#1e2d24] rounded-lg px-4 py-3 font-mono text-xs text-[#d4ede0]">
            {`github.com/avalanche-team1/\nx402-all-in-one`}
          </pre>
        </div>
        <div className="bg-cream/70 border border-forest/15 rounded-xl px-6 py-5">
          <p className="font-mono text-xs tracking-widest uppercase text-forest mb-3">agentic.market 등록</p>
          <p className="font-sans text-sm text-dark/70 leading-relaxed mb-4">
            AI 에이전트들이 탐색하는<br />마켓에 서비스 올리기
          </p>
          <pre className="bg-[#1e2d24] rounded-lg px-4 py-3 font-mono text-xs text-[#d4ede0]">
            agentic.market/register
          </pre>
        </div>
      </div>
      <div className="fade-in-stagger w-full bg-forest/10 border border-forest/20 rounded-xl px-6 py-4 font-sans text-base text-forest text-center" style={{ animationDelay: '0.9s' }}>
        AI 에이전트가 여러분의 플랫폼에 찾아와 구매해가는 구조
      </div>
    </div>
  </div>
)

export default Slide13Bonus
