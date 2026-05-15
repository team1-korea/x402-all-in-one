interface Props { isActive: boolean; animKey: number }

const Slide10Go = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '60vw', height: '60vw', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.04, animationDelay: '-1s' }} />
    <div key={animKey} className="flex flex-col items-center content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-6" style={{ animationDelay: '0s' }}>07 · Marathon</p>
      <div className="fade-in-stagger font-serif text-[12vw] font-bold text-terracotta leading-none mb-2" style={{ animationDelay: '0.2s' }}>
        GO
      </div>
      <div className="fade-in-stagger font-mono text-base tracking-[0.3em] uppercase text-sage mb-8" style={{ animationDelay: '0.6s' }}>
        QUEST MARATHON
      </div>
      <pre className="fade-in-stagger bg-[#1e2d24] rounded-xl px-10 py-5 font-mono text-2xl text-[#d4ede0] text-center mb-6" style={{ animationDelay: '0.9s' }}>
        /x402-quest
      </pre>
      <div className="fade-in-stagger bg-terracotta/5 border border-terracotta/25 rounded-xl px-6 py-4 font-sans text-base text-terracotta/90 text-center" style={{ animationDelay: '1.2s' }}>
        초기 지급 <strong className="text-dark font-medium">10 TONE</strong> · 10개 퀘스트 전부 1 TONE · 10 TONE으로 딱 완주
      </div>
    </div>
  </div>
)

export default Slide10Go
