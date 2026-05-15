interface Props { animKey: number }

const items = [
  { label: '클로드에게 결제 능력 심어주기', sub: 'SKILL.md 구멍을 채워 스킬을 장착시킵니다', delay: '0.4s' },
  { label: '퀘스트 실전 훈련 — 10판 완주', sub: '실시간 순위, 잘 가르친 보호자 Top 3에게 선물', delay: '1.0s' },
  { label: '내 플랫폼에 돈 내러 오는 AI 만들기', sub: '오늘 자리를 뜨면, 우리 클로드 독립합니다', delay: '1.6s' },
]

const Slide02Agenda = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '50vw', height: '50vw', bottom: '-10%', right: '-10%', opacity: 0.07, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>01 · 커리큘럼</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-10" style={{ animationDelay: '0.2s' }}>오늘 클로드가 배울 것들</h2>
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
