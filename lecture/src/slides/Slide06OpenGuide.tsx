interface Props { animKey: number }

const PATH = '~/.claude/skills/x402-pay/SKILL.md'

const steps = [
  {
    num: '01',
    title: 'VSCode 열기',
    content: null,
  },
  {
    num: '02',
    title: '파일 열기',
    content: (
      <div className="flex flex-col gap-3 mt-3">
        <div className="flex items-start gap-3">
          <span className="font-mono text-xs bg-sage/15 text-sage px-2 py-0.5 rounded shrink-0 mt-0.5">Mac</span>
          <p className="font-mono text-sm text-dark/70">
            <span className="text-terracotta font-semibold">Cmd+O</span>
            {' '}→ 파일 다이얼로그에서{' '}
            <span className="text-terracotta font-semibold">Cmd+Shift+G</span>
            {' '}→ 경로 붙여넣기
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="font-mono text-xs bg-sage/15 text-sage px-2 py-0.5 rounded shrink-0 mt-0.5">Win</span>
          <p className="font-mono text-sm text-dark/70">
            <span className="text-terracotta font-semibold">Ctrl+O</span>
            {' '}→ 경로 붙여넣기
          </p>
        </div>
        <code className="font-mono text-sm text-forest bg-forest/8 border border-forest/20 px-4 py-2.5 rounded-lg mt-1">
          {PATH}
        </code>
      </div>
    ),
  },
  {
    num: '03',
    title: 'TODO 찾기',
    content: (
      <div className="mt-3">
        <p className="font-mono text-sm text-dark/70 mb-2">
          <span className="text-terracotta font-semibold">Ctrl+F</span>
          {' '}→ 검색어 입력
        </p>
        <code className="font-mono text-sm text-terracotta bg-terracotta/8 border border-terracotta/20 px-4 py-2.5 rounded-lg">
          [TODO
        </code>
        <p className="font-sans text-sm text-sage mt-2.5">채워야 할 구멍 4개가 있습니다</p>
      </div>
    ),
  },
]

const Slide06OpenGuide = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '40vw', height: '40vw', bottom: '-8%', left: '-5%', opacity: 0.06, animationDelay: '-5s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-3xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>05 · Explore</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-3" style={{ animationDelay: '0.2s' }}>SKILL.md 열기</h2>
      <p className="fade-in-stagger font-sans font-light text-base text-sage mb-10" style={{ animationDelay: '0.4s' }}>VSCode에서 직접 수정합니다</p>

      <div className="fade-in-stagger flex flex-col gap-4 w-full" style={{ animationDelay: '0.6s' }}>
        {steps.map(({ num, title, content }) => (
          <div key={num} className="flex gap-6 bg-cream/70 border border-sage/15 rounded-xl px-7 py-5">
            <span className="font-mono text-2xl text-sage/40 font-bold shrink-0 pt-0.5">{num}</span>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-lg text-dark font-medium">{title}</p>
              {content}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Slide06OpenGuide
