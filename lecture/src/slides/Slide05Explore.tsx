interface Props { animKey: number }

const holes = [
  '[TODO: 이 서명이 언제까지 유효해야 하나요?]',
  '[TODO: 어떤 인코딩 방식으로 변환해야 하나요?]',
  '[TODO: 누구에게 넘겨서 온체인 검증을 맡기나요?]',
]

const Slide05Explore = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '42vw', height: '42vw', top: '-8%', left: '-5%', opacity: 0.06, animationDelay: '-5s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>04 · Explore</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-3" style={{ animationDelay: '0.2s' }}>
        <code className="font-mono text-4xl text-forest">x402-pay/SKILL.md</code> 열어보기
      </h2>
      <p className="fade-in-stagger font-sans font-light text-base text-sage mb-6" style={{ animationDelay: '0.5s' }}>
        흐름 설명 부분에 이런 빈칸들이 있습니다
      </p>
      <div className="fade-in-stagger flex flex-col gap-2 w-full" style={{ animationDelay: '0.7s' }}>
        {holes.map((h) => (
          <div key={h} className="w-full bg-[#1a0e2e]/5 border border-dashed border-[#7c3aed]/30 rounded-lg px-5 py-3 font-mono text-sm text-[#7c3aed]/80">
            {h}
          </div>
        ))}
      </div>
      <div className="fade-in-stagger w-full mt-5 bg-terracotta/5 border border-terracotta/25 rounded-xl px-6 py-4 font-sans text-sm text-terracotta/90" style={{ animationDelay: '1.2s' }}>
        이 구멍들이 채워져야 Claude가 실제로 결제할 수 있습니다
      </div>
    </div>
  </div>
)

export default Slide05Explore
