interface Props { animKey: number }

const skills = [
  { slash: '/commit', desc: 'staged 변경사항을 분석해 conventional commit 메시지 자동 작성' },
  { slash: '/review', desc: 'PR 전체 diff를 읽고 버그·보안·품질 이슈 리포트' },
  { slash: '/ship',   desc: '테스트 → 빌드 → PR 생성까지 한 번에' },
]

const Slide03Skills = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '45vw', height: '45vw', top: '-5%', right: '-8%', opacity: 0.04, animationDelay: '-6s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-4xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>02 · Claude Skills</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-4" style={{ animationDelay: '0.2s' }}>Claude 스킬이란?</h2>
      <p className="fade-in-stagger font-sans text-xl text-dark/60 mb-8" style={{ animationDelay: '0.4s' }}>
        <code className="bg-forest/10 px-2 py-0.5 rounded text-forest font-mono">/</code>
        {' '}를 치면 나오는 슬래시 명령어 — <strong className="text-dark font-medium">.md 파일 하나</strong>로 만들어집니다
      </p>
      <div className="fade-in-stagger w-full flex flex-col gap-3 mb-7" style={{ animationDelay: '0.7s' }}>
        {skills.map(({ slash, desc }) => (
          <div key={slash} className="flex items-center gap-5 bg-cream/70 border border-forest/15 rounded-xl px-6 py-4">
            <code className="font-mono text-lg text-terracotta font-semibold w-24 shrink-0">{slash}</code>
            <span className="font-sans text-base text-dark/70">{desc}</span>
          </div>
        ))}
      </div>
      <div className="fade-in-stagger w-full bg-forest/8 border border-forest/20 rounded-xl px-7 py-4 font-sans text-base text-dark/60" style={{ animationDelay: '1.0s' }}>
        코드가 아닙니다 — Claude에게 보내는 <strong className="text-forest font-medium">자연어 지시문</strong>입니다
      </div>
    </div>
  </div>
)

export default Slide03Skills
