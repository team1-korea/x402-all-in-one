interface Props { isActive: boolean; animKey: number }

const Slide01Title = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '40vw', height: '40vw', top: '-10%', right: '-5%', opacity: 0.04 }} />
    <div className="ambient-shape bg-forest" style={{ width: '35vw', height: '35vw', bottom: '-10%', left: '-8%', opacity: 0.05, animationDelay: '-4s' }} />
    <div key={animKey} className="flex flex-col items-center text-center gap-6 content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage" style={{ animationDelay: '0s' }}>
        Avalanche x402 Meetup · 2026.05.28
      </p>
      <h1 className="fade-in-stagger font-serif text-7xl md:text-8xl text-dark leading-tight" style={{ animationDelay: '0.3s' }}>
        금쪽같은 내 클로드의<br />
        <span className="text-terracotta">첫 결제</span>
        <span className="block font-sans font-light text-3xl text-sage mt-3">feat. x402</span>
      </h1>
      <p className="fade-in-stagger font-sans font-light text-xl text-sage" style={{ animationDelay: '1.0s' }}>
        Claude가 직접 돈을 내고 서비스를 사오는 구조를 만들어봅니다
      </p>
    </div>
  </div>
)

export default Slide01Title
