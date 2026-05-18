interface Props { animKey: number }

const Slide10Test = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '42vw', height: '42vw', bottom: '-10%', right: '-8%', opacity: 0.05, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>07 · Lab — 테스트</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>클로드, 첫 결제 시켜보기</h2>
      <pre className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-6 font-mono text-2xl text-[#d4ede0] text-center mb-6" style={{ animationDelay: '0.5s' }}>
        /x402-pay
      </pre>
      <div className="fade-in-stagger w-full bg-cream/70 border border-forest/20 rounded-xl px-6 py-5 font-sans text-lg text-dark/80 text-center" style={{ animationDelay: '0.9s' }}>
        Claude가 실제로 서버에 요청하고<br />
        <strong className="font-medium text-dark">결제 → 퀘스트 수신</strong> 까지 하면 성공
      </div>
    </div>
  </div>
)

export default Slide10Test
