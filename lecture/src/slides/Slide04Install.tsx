interface Props { animKey: number }

const Slide04Install = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '38vw', height: '38vw', bottom: '-8%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-4xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>03 · Setup</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-10" style={{ animationDelay: '0.2s' }}>스킬 설치하기</h2>

      <div className="fade-in-stagger flex flex-col gap-5 w-full mb-8" style={{ animationDelay: '0.5s' }}>
        <div className="bg-forest/10 border border-forest/20 rounded-xl px-6 py-5">
          <p className="font-mono text-sm tracking-widest uppercase text-forest mb-4">💻 터미널 있는 분</p>
          <pre className="bg-[#1e2d24] rounded-lg px-6 py-4 font-mono text-base text-[#d4ede0] whitespace-pre-wrap">
            {'npx team1-x402 --url='}
            <span style={{ color: '#fbbf24' }}>https://x402.abcfe.net</span>
          </pre>
        </div>

        <div className="bg-cream/70 border border-sage/20 rounded-xl px-6 py-5">
          <p className="font-mono text-sm tracking-widest uppercase text-sage mb-3">🌐 터미널 없는 분</p>
          <p className="font-sans text-base text-dark/70 leading-relaxed">
            브라우저 →{' '}
            <code className="bg-sage/10 px-2 py-0.5 rounded text-forest font-mono text-sm">vscode.dev</code>
            {' '}→ Terminal → New Terminal → 동일 명령어 실행
          </p>
        </div>
      </div>

      <p className="fade-in-stagger font-sans text-base text-sage text-center" style={{ animationDelay: '0.9s' }}>
        완료되면 → 키로 다음 화면
      </p>
    </div>
  </div>
)

export default Slide04Install
