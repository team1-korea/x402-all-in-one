interface Props { animKey: number }

const Slide14Bonus = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '40vw', height: '40vw', bottom: '-8%', right: '-5%', opacity: 0.04, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-5xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>Bonus</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-2 text-center" style={{ animationDelay: '0.2s' }}>
        내 서비스를 <span className="text-terracotta">x402</span>로 등록하기
      </h2>
      <p className="fade-in-stagger font-sans font-light text-base text-sage mb-8" style={{ animationDelay: '0.4s' }}>
        AI 에이전트가 여러분의 API에 찾아와 직접 구매하는 구조
      </p>

      <div className="fade-in-stagger grid grid-cols-2 gap-5 w-full mb-6" style={{ animationDelay: '0.6s' }}>
        {/* agentic.market */}
        <div className="bg-cream/70 border border-sage/20 rounded-xl px-6 py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm tracking-widest uppercase text-forest font-semibold">agentic.market</p>
            <span className="font-mono text-xs bg-forest/10 text-forest px-2 py-0.5 rounded">Base</span>
          </div>
          <p className="font-sans text-sm text-dark/60">지금 바로 올릴 수 있는 오픈 마켓 · 894개 서비스</p>
          <div className="flex flex-col gap-2">
            <div className="bg-forest/8 border border-forest/15 rounded-lg px-4 py-3">
              <p className="font-mono text-xs text-forest mb-1">이미 x402 서버가 있다면</p>
              <code className="font-mono text-sm text-dark">agentic.market/validate</code>
              <p className="font-sans text-xs text-sage mt-1">URL 입력 → 검증 → Bazaar 자동 노출</p>
            </div>
            <div className="bg-sage/8 border border-sage/15 rounded-lg px-4 py-3">
              <p className="font-mono text-xs text-sage mb-1">서버가 없다면</p>
              <code className="font-mono text-sm text-dark">agentic.market/validate</code>
              <p className="font-sans text-xs text-sage mt-1">Setup Wizard → 엔드포인트 정보 입력 → 코드 생성</p>
            </div>
          </div>
        </div>

        {/* Kite AI */}
        <div className="bg-cream/70 border border-sage/20 rounded-xl px-6 py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm tracking-widest uppercase text-terracotta font-semibold">Kite AI</p>
            <span className="font-mono text-xs bg-terracotta/10 text-terracotta px-2 py-0.5 rounded">Avalanche</span>
          </div>
          <p className="font-sans text-sm text-dark/60">아발란체 생태계 특화 · 큐레이션 마켓</p>
          <div className="bg-terracotta/8 border border-terracotta/15 rounded-lg px-4 py-3 flex-1 flex flex-col justify-center">
            <p className="font-mono text-xs text-terracotta mb-2">현재 웨잇리스트 운영 중</p>
            <p className="font-sans text-sm text-dark/70 leading-relaxed">
              탄탄한 Avalanche 생태계 기반의 마켓에 올리고 싶다면 웨잇리스트에 등록해두세요
            </p>
          </div>
        </div>
      </div>

      <div className="fade-in-stagger w-full bg-forest/8 border border-forest/15 rounded-xl px-7 py-4 font-mono text-sm text-forest/80 text-center" style={{ animationDelay: '0.9s' }}>
        오늘 만든 x402-server가 그대로 레퍼런스 &amp; 템플릿이 됩니다 →{' '}
        <span className="text-forest font-medium">github.com/team1-korea/x402-all-in-one</span>
      </div>
    </div>
  </div>
)

export default Slide14Bonus
