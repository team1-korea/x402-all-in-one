interface Props { animKey: number }

const methods = [
  {
    icon: '🖥️',
    label: 'VSCode',
    desc: '탐색기 → ~/.claude/plugins/team1-x402 폴더 열기',
  },
  {
    icon: '📝',
    label: '메모장 / TextEdit',
    desc: '파일 탐색기에서 SKILL.md 더블클릭 → 텍스트 편집기로 열기',
  },
  {
    icon: '⌨️',
    label: '터미널',
    desc: 'cat ~/.claude/plugins/team1-x402/x402-pay/SKILL.md',
  },
  {
    icon: '🤖',
    label: 'Claude Code',
    desc: '/x402-pay 실행 전 Claude에게 스킬 파일 읽게 하면 미리 확인 가능',
  },
]

const Slide06OpenGuide = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '40vw', height: '40vw', bottom: '-8%', left: '-5%', opacity: 0.06, animationDelay: '-5s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-4xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>05 · Explore</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-10" style={{ animationDelay: '0.2s' }}>SKILL.md 열기</h2>
      <div className="fade-in-stagger flex flex-col gap-4 w-full" style={{ animationDelay: '0.5s' }}>
        {methods.map(({ icon, label, desc }) => (
          <div key={label} className="flex items-start gap-5 bg-cream/70 border border-sage/15 rounded-xl px-6 py-5">
            <span className="text-3xl flex-shrink-0">{icon}</span>
            <div>
              <p className="font-sans text-lg text-dark font-medium mb-1.5">{label}</p>
              <p className="font-sans text-base text-dark/60 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Slide06OpenGuide
