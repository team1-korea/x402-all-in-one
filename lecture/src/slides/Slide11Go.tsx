interface Props { animKey: number }

const Slide11Go = ({ animKey }: Props) => {
  return (
    <div className="slide bg-beige content-z-index">
      <div className="ambient-shape bg-terracotta" style={{ width: '60vw', height: '60vw', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.04, animationDelay: '-1s' }} />
      <div key={animKey} className="flex flex-col items-center w-full content-z-index">
        <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-6" style={{ animationDelay: '0s' }}>Marathon</p>
        <div className="fade-in-stagger font-serif text-[12vw] font-bold text-terracotta leading-none mb-2" style={{ animationDelay: '0.2s' }}>
          GO
        </div>
        <div className="fade-in-stagger font-mono text-lg tracking-[0.3em] uppercase text-sage mb-8" style={{ animationDelay: '0.6s' }}>
          QUEST MARATHON
        </div>
        <pre className="fade-in-stagger bg-[#1e2d24] rounded-xl px-10 py-5 font-mono text-2xl text-[#d4ede0] text-center mb-6" style={{ animationDelay: '0.9s' }}>
          /x402-quest
        </pre>

        {/* 100 USDC 가이드 */}
        <div className="fade-in-stagger flex flex-col items-center gap-3 w-full max-w-2xl mb-6" style={{ animationDelay: '1.1s' }}>
          <div className="bg-terracotta/10 border border-terracotta/30 rounded-xl px-8 py-3 font-mono text-lg text-terracotta font-semibold">
            100 USDC 에어드랍
          </div>
        </div>
      </div>
    </div>
  )
}

export default Slide11Go
