interface Props { animKey: number }

const Slide04Install = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '38vw', height: '38vw', bottom: '-8%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-4xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>03 · Setup</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-10" style={{ animationDelay: '0.2s' }}>스킬 설치하기</h2>

      <div className="fade-in-stagger flex flex-col gap-5 w-full mb-8" style={{ animationDelay: '0.5s' }}>
        <div className="bg-forest/10 border border-forest/20 rounded-xl px-3 py-5">
          <pre className="bg-[#1e2d24] rounded-lg px-4 py-10 font-mono text-2xl text-[#d4ede0] whitespace-pre-wrap text-center">
            {'npx team1-x402 --url='}
            <span style={{ color: '#fbbf24' }}>x402.abcfe.net</span>
          </pre>
        </div>
      </div>
    </div>
  </div>
)

export default Slide04Install
