interface Props { animKey: number; step?: number }

const frames = [
  { num: '①', sub: '욕구 발생',  caption: '아 아이폰 사고 싶다',    img: '/story-01-desire.png' },
  { num: '②', sub: '탐색',      caption: '애플스토어 목록 확인',    img: '/story-02-explore.png' },
  { num: '③', sub: '요청',      caption: '"아이폰 13 주세요"',      img: '/story-03-request.png' },
  { num: '④', sub: '결제 요구', caption: '"결제해주세요"',           img: '/story-04-payment.png' },
  { num: '⑤', sub: '서명',      caption: '카드 꽂기',               img: '/story-05-sign.png' },
  { num: '⑥', sub: '승인',      caption: '카드사 처리',             img: '/story-06-approve.png' },
  { num: '⑦', sub: '수령',      caption: '아이폰 수령!',            img: '/story-07-receive.png' },
]

function StoryFrame({ frame, revealed }: { frame: typeof frames[0]; revealed: boolean }) {
  return (
    <div
      data-testid="story-frame"
      style={{
        opacity: revealed ? 1 : 0.12,
        filter: revealed ? 'none' : 'blur(3px)',
        transition: 'opacity 0.5s ease, filter 0.5s ease',
        border: `1.5px solid ${revealed ? '#C4714A40' : '#d4c8b8'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'rgba(255,253,249,0.8)',
      }}
    >
      <div style={{ aspectRatio: '4/3', background: '#e8e2d8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img
          src={frame.img}
          alt={frame.caption}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        <span style={{ fontFamily: 'serif', fontSize: '2rem', opacity: 0.25, position: 'relative', zIndex: 1 }}>
          {frame.num}
        </span>
      </div>
      <div style={{ padding: '10px 12px', borderTop: '1px solid #e8e2d8' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#C4714A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          {frame.num} {frame.sub}
        </p>
        <p style={{ fontFamily: 'sans-serif', fontSize: '14px', color: '#1A1A1A', lineHeight: 1.3 }}>
          {frame.caption}
        </p>
      </div>
    </div>
  )
}

const Slide07IphoneStory = ({ animKey, step = 0 }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '45vw', height: '45vw', bottom: '-10%', right: '-10%', opacity: 0.07, animationDelay: '-4s' }} />

    {step === 0 ? (
      <div key={`${animKey}-title`} className="flex flex-col items-center content-z-index">
        <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>
          06 · Theory — 아이폰 비유
        </p>
        <h2 className="fade-in-stagger font-serif text-6xl text-dark" style={{ animationDelay: '0.2s' }}>
          아이폰 사러 애플스토어 가기
        </h2>
      </div>
    ) : (
      <div key={`${animKey}-grid`} className="fade-in-stagger w-full max-w-7xl content-z-index">
        <div className="w-full grid grid-cols-4 gap-4">
          {frames.map((f, i) => (
            <StoryFrame key={f.num} frame={f} revealed={step > i} />
          ))}
        </div>
      </div>
    )}
  </div>
)

export default Slide07IphoneStory
