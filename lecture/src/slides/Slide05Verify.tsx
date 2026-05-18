interface Props { animKey: number }

const troubleItems = [
  { q: '목록에 없다', a: 'Claude Code 재시작 → / 다시 입력' },
  { q: '명령어 오류', a: 'URL에 https:// 포함됐는지 확인' },
  { q: '그래도 안 됨', a: '손 들기 🙋 스태프가 도와드립니다' },
]

const Slide05Verify = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '42vw', height: '42vw', top: '-8%', right: '-5%', opacity: 0.05, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-4xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>04 · Verify</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-7" style={{ animationDelay: '0.2s' }}>제대로 설치됐나요?</h2>

      <div className="fade-in-stagger w-full bg-forest/10 border border-forest/20 rounded-xl px-6 py-5 mb-5" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-start gap-4">
          <span className="font-mono text-base flex-shrink-0 mt-0.5">1️⃣</span>
          <div>
            <p className="font-sans text-lg text-dark mb-3">
              Claude Code에서{' '}
              <code className="bg-forest/10 px-2 py-0.5 rounded text-forest font-mono text-base">/</code>
              {' '}입력 후 목록 확인
            </p>
            <div className="flex gap-2.5 flex-wrap">
              {['x402-pay', 'x402-discover', 'x402-quest'].map((s) => (
                <span key={s} className="bg-forest/15 border border-forest/30 rounded px-2.5 py-1 font-mono text-sm text-forest">
                  {s}
                </span>
              ))}
            </div>
            <p className="font-sans text-sm text-sage mt-2.5">세 개 모두 보이면 완료</p>
          </div>
        </div>
      </div>

      <div className="fade-in-stagger w-full bg-cream/70 border border-sage/20 rounded-xl px-6 py-5 mb-5" style={{ animationDelay: '0.7s' }}>
        <div className="flex items-start gap-4">
          <span className="font-mono text-base flex-shrink-0 mt-0.5">2️⃣</span>
          <div className="w-full">
            <p className="font-sans text-lg text-dark mb-3">파일 위치</p>
            <pre className="bg-[#1e2d24] rounded-lg px-5 py-4 font-mono text-sm text-[#d4ede0] leading-relaxed">
              <span style={{ color: '#7eca9c' }}>{'~/.claude/plugins/'}</span>{'\n'}
              <span style={{ color: '#5a8068' }}>{'└─ '}</span>
              <span style={{ color: '#7eca9c' }}>{'team1-x402/'}</span>{'\n'}
              <span style={{ color: '#5a8068' }}>{'   ├─ '}</span>
              <span style={{ color: '#fbbf24' }}>{'x402-pay/SKILL.md'}</span>{'\n'}
              <span style={{ color: '#5a8068' }}>{'   ├─ '}</span>{'x402-discover/SKILL.md'}{'\n'}
              <span style={{ color: '#5a8068' }}>{'   └─ '}</span>{'x402-quest/SKILL.md'}
            </pre>
          </div>
        </div>
      </div>

      <div className="fade-in-stagger w-full bg-terracotta/5 border border-terracotta/20 rounded-xl px-6 py-5" style={{ animationDelay: '0.9s' }}>
        <p className="font-mono text-sm tracking-widest uppercase text-terracotta mb-4">⚠ 스킬이 안 보이면?</p>
        <div className="flex flex-col gap-3">
          {troubleItems.map(({ q, a }) => (
            <div key={q} className="flex gap-4 text-base">
              <span className="font-mono text-terracotta/80 font-medium min-w-[110px] flex-shrink-0">{q}</span>
              <span className="font-sans text-dark/70">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default Slide05Verify
