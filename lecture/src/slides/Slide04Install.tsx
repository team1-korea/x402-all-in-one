interface Props { isActive: boolean; animKey: number }

const Slide04Install = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '38vw', height: '38vw', bottom: '-8%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>03 · Install</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>스킬 설치</h2>
      <pre className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-5 font-mono text-lg text-[#d4ede0] text-center mb-6" style={{ animationDelay: '0.5s' }}>
        npx x402-meetup --url=https://api.x402-meetup.example.com
      </pre>
      <div className="fade-in-stagger w-full bg-cream/70 border border-forest/20 rounded-xl px-6 py-5 mb-5 font-sans text-base text-dark/80" style={{ animationDelay: '0.9s' }}>
        설치 확인: Claude Code에서{' '}
        <code className="bg-forest/10 px-2 py-0.5 rounded text-forest font-mono text-sm">/</code>
        {' '}입력 →<br />
        <strong className="font-medium text-dark">x402-pay, x402-discover, x402-quest</strong>가 목록에 보이면 OK
      </div>
      <p className="fade-in-stagger font-sans text-sm text-sage" style={{ animationDelay: '1.2s' }}>
        VSCode 없으신 분 → vscode.dev 또는 메모장도 됩니다
      </p>
    </div>
  </div>
)

export default Slide04Install
