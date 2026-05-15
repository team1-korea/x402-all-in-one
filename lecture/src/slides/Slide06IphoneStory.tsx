interface Props { animKey: number }

const steps = [
  { n: '1', text: '아 아이폰 사고 싶다 → 필요한 게 생겼다' },
  { n: '2', text: '애플스토어에서 목록 확인 → 원하는 것 찾기' },
  { n: '3', jsx: <>"아이폰 13 주세요" → <strong className="text-terracotta font-medium">원하는 것을 요청</strong></> },
  { n: '4', jsx: <><strong className="text-terracotta font-medium">"결제해주세요"</strong> → 얼마를, 어디로, 언제까지</> },
  { n: '5', jsx: <>카드 꽂기 → <strong className="text-terracotta font-medium">서명 생성</strong> + 다시 요청</> },
  { n: '6', text: '카드사 승인 → 검증 + 블록체인 정산' },
  { n: '7', jsx: <><strong className="text-terracotta font-medium">아이폰 수령</strong> → 서비스 응답</> },
]

const Slide06IphoneStory = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '45vw', height: '45vw', bottom: '-10%', right: '-10%', opacity: 0.07, animationDelay: '-4s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>05 · Theory — 아이폰 비유</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>아이폰 사러 애플스토어 가기</h2>
      <div className="fade-in-stagger flex flex-col gap-3 w-full" style={{ animationDelay: '0.5s' }}>
        {steps.map(({ n, text, jsx }) => (
          <div key={n} className="flex items-start gap-4">
            <div className="bg-forest text-[#d4ede0] w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs flex-shrink-0 mt-0.5">
              {n}
            </div>
            <p className="font-sans text-base text-dark leading-relaxed">{jsx ?? text}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Slide06IphoneStory
