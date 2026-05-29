interface Props { animKey: number }

const Slide01Title = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '40vw', height: '40vw', top: '-10%', right: '-5%', opacity: 0.04 }} />
    <div className="ambient-shape bg-forest" style={{ width: '35vw', height: '35vw', bottom: '-10%', left: '-8%', opacity: 0.05, animationDelay: '-4s' }} />
    <div key={animKey} className="flex flex-col items-center text-center w-full content-z-index">
      <img
        src="/title.png"
        alt="금쪽같은 내 클로드의 첫 결제교육 feat x402"
        className="fade-in-stagger max-w-[80%] max-h-[70vh] object-contain"
        style={{ animationDelay: '0.2s', mixBlendMode: 'screen' }}
      />
    </div>
  </div>
)

export default Slide01Title
