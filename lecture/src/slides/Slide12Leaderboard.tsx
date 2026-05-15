interface Props { isActive: boolean; animKey: number }

const Slide12Leaderboard = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '50vw', height: '50vw', top: '-10%', right: '-10%', opacity: 0.04, animationDelay: '-6s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>07 · Marathon — 실시간 순위</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>순위판</h2>
      <pre className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-5 font-mono text-base text-[#d4ede0] text-center mb-5" style={{ animationDelay: '0.5s' }}>
        http://[서버주소]/leaderboard
      </pre>
      <p className="fade-in-stagger font-sans font-light text-sm text-sage" style={{ animationDelay: '0.9s' }}>
        발표 화면에서 실시간으로 보여드립니다
      </p>
    </div>
  </div>
)

export default Slide12Leaderboard
