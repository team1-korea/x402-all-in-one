interface Props { animKey: number }

const Slide04Install = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '38vw', height: '38vw', bottom: '-8%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>03 · Setup</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>스킬 설치하기</h2>

      <div className="fade-in-stagger flex flex-col gap-4 w-full mb-6" style={{ animationDelay: '0.5s' }}>
        <div className="bg-forest/10 border border-forest/20 rounded-xl px-5 py-4">
          <p className="font-mono text-xs tracking-widest uppercase text-forest mb-3">💻 터미널 있는 분</p>
          <pre className="bg-[#1e2d24] rounded-lg px-5 py-3 font-mono text-sm text-[#d4ede0] whitespace-pre-wrap">
            {'npx team1-x402 --url='}
            <span style={{ color: '#fbbf24' }}>강사화면 URL</span>
          </pre>
        </div>

        <div className="bg-cream/70 border border-sage/20 rounded-xl px-5 py-4">
          <p className="font-mono text-xs tracking-widest uppercase text-sage mb-2">🌐 터미널 없는 분</p>
          <p className="font-sans text-sm text-dark/70 leading-relaxed">
            브라우저 →{' '}
            <code className="bg-sage/10 px-1.5 py-0.5 rounded text-forest font-mono text-xs">vscode.dev</code>
            {' '}→ Terminal → New Terminal → 동일 명령어 실행
          </p>
        </div>
      </div>

      <p className="fade-in-stagger font-sans text-sm text-sage text-center" style={{ animationDelay: '0.9s' }}>
        완료되면 → 키로 다음 화면
      </p>
    </div>
  </div>
)

export default Slide04Install
