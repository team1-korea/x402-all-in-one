interface Props { animKey: number }

type Hint = {
  num: string
  iphone: string
  hole: string
  hint: string
  img?: string  // public/ 경로
}

const hints: Hint[] = [
  {
    num: '①',
    iphone: '카드 유효기간',
    hole: 'validBefore?',
    hint: '지금 시각 + maxTimeoutSeconds초 뒤 Unix timestamp',
    img: '/hint-validbefore.png',
  },
  {
    num: '②',
    iphone: '봉투에 넣기',
    hole: '인코딩 방식?',
    hint: 'JSON → 텍스트로 변환하는 방식 (힌트: btoa)',
    img: '/hint-base64.png',
  },
  {
    num: '③',
    iphone: '카드사',
    hole: '누가 검증?',
    hint: '네트워크 정보 테이블의 Facilitator URL',
    img: '/hint-facilitator.png',
  },
]

const Slide08Hints = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '35vw', height: '35vw', top: '-5%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-3xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-3" style={{ animationDelay: '0s' }}>06 · Lab</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-2" style={{ animationDelay: '0.2s' }}>구멍 채우기</h2>
      <p className="fade-in-stagger font-sans font-light text-sm text-sage mb-6" style={{ animationDelay: '0.4s' }}>
        x402-pay/SKILL.md 열고 [TODO] 3개를 자연어로 채우세요
      </p>
      <div className="fade-in-stagger flex flex-col gap-4 w-full" style={{ animationDelay: '0.6s' }}>
        {hints.map(({ num, iphone, hole, hint, img }) => (
          <div key={num} className="flex items-center gap-4 bg-cream/60 rounded-xl border border-sage/15 px-5 py-4">
            {img && (
              <img
                src={img}
                alt={hole}
                className="w-20 h-20 object-contain rounded-lg flex-shrink-0 bg-white/50"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-terracotta text-xs">{num}</span>
                <span className="font-mono text-xs text-sage bg-sage/10 px-2 py-0.5 rounded">
                  아이폰 비유: {iphone}
                </span>
              </div>
              <p className="font-sans text-base text-dark font-medium mb-0.5">{hole}</p>
              <p className="font-sans text-sm text-dark/60">{hint}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="fade-in-stagger w-full mt-4 bg-forest/10 border border-forest/20 rounded-xl px-5 py-3 font-sans text-sm text-forest" style={{ animationDelay: '1.0s' }}>
        정확하지 않아도 됩니다 — 비슷한 의미면 Claude가 알아서 해석합니다
      </div>
    </div>
  </div>
)

export default Slide08Hints
