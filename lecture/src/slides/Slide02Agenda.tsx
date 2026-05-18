interface Props { animKey: number; step?: number }

const cards = [
  {
    tag: '관찰',
    title: '웹은 이곳저곳 다 다닙니다',
    sub: '검색도, 코딩도, 파일도, API 호출도 — 척척 해냅니다',
    accent: 'border-sage',
  },
  {
    tag: '진단',
    title: '그런데 아무것도 못 삽니다',
    sub: '유료 콘텐츠 앞에서 멈춥니다. 돈 내는 법을 모릅니다.',
    accent: 'border-terracotta',
  },
  {
    tag: '처방',
    title: '결제 능력을 이식합니다',
    sub: 'x402 스킬을 장착하면 — 돈도 내는 AI가 됩니다',
    accent: 'border-forest',
  },
]

const Slide02Agenda = ({ animKey, step = 0 }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '50vw', height: '50vw', bottom: '-10%', right: '-10%', opacity: 0.07, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-4xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>오늘의 진단</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-12" style={{ animationDelay: '0.2s' }}>우리 클로드, 뭐가 문제일까요?</h2>
      <div className="flex flex-col gap-5 w-full">
        {cards.map(({ tag, title, sub, accent }, i) => (
          <div
            key={tag}
            className={`flex flex-col gap-1.5 bg-cream/60 rounded-xl px-7 py-5 border-l-2 ${accent}`}
            style={{
              opacity: step > i ? 1 : 0.4,
              filter: step > i ? 'none' : 'blur(2.5px)',
              transition: 'opacity 0.5s ease, filter 0.5s ease',
            }}
          >
            <p className="font-mono text-xs tracking-widest uppercase text-sage mb-1">{tag}</p>
            <p className="font-sans text-xl text-dark">{title}</p>
            <p className="font-sans font-light text-base text-sage">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Slide02Agenda
