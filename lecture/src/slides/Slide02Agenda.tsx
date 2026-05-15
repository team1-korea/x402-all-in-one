interface Props { isActive: boolean; animKey: number }

const items = [
  { label: 'Claude Skills로 x402 결제 능력 부여', accent: 'x402 결제 능력', sub: 'SKILL.md 파일 구멍 채우기', delay: '0.4s' },
  { label: '퀘스트 마라톤 — 10개 완주', accent: '퀘스트 마라톤', sub: '실시간 순위, Top 3 선물', delay: '1.0s' },
  { label: 'AI 에이전트가 내 플랫폼에 찾아와 구매하는 감각', accent: '내 플랫폼에 찾아와 구매', sub: '오늘 자리를 뜨면 이 감각을 가져가세요', delay: '1.6s' },
]

const Slide02Agenda = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '50vw', height: '50vw', bottom: '-10%', right: '-10%', opacity: 0.07, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>01 · Agenda</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-10" style={{ animationDelay: '0.2s' }}>오늘 할 것들</h2>
      <div className="flex flex-col gap-4 w-full">
        {items.map(({ label, sub, delay }) => (
          <div key={label} className="fade-in-stagger flex flex-col gap-1 bg-cream/60 rounded-lg px-5 py-4 border-l-2 border-terracotta" style={{ animationDelay: delay }}>
            <p className="font-sans text-lg text-dark">{label}</p>
            <p className="font-sans font-light text-sm text-sage">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Slide02Agenda
