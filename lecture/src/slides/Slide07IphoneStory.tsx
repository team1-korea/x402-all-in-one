import { useState } from 'react'
import { createPortal } from 'react-dom'

interface Props { animKey: number; step?: number }

const frames = [
  { num: '①', sub: '욕구 발생',  caption: '아 아이폰 사고 싶다',    img: '/story-01-desire.png',   x402: '구매 필요 확인',                    highlight: false },
  { num: '②', sub: '탐색',      caption: '애플스토어 목록 확인',    img: '/story-02-explore.png',  x402: 'llms.txt 확인',                     highlight: false },
  { num: '③', sub: '요청',      caption: '"아이폰 13 주세요"',      img: '/story-03-request.png',  x402: '전자책 다운로드 요청',              highlight: false },
  { num: '④', sub: '결제 요구', caption: '"결제해주세요"',           img: '/story-04-payment.png',  x402: '402 — 결제 필요',                   highlight: true  },
  { num: '⑤', sub: '서명',      caption: '카드 꽂기',               img: '/story-05-sign.png',     x402: '결제 서명 & 재요청',                highlight: false },
  { num: '⑥', sub: '승인',      caption: '카드사 처리',             img: '/story-06-approve.png',  x402: '결제 검증 & 승인',                  highlight: false },
  { num: '⑦', sub: '수령',      caption: '아이폰 수령!',            img: '/story-07-receive.png',  x402: '전자책 PDF 링크 수신',              highlight: false },
]

function StoryFrame({ frame, revealed, onOpen }: { frame: typeof frames[0]; revealed: boolean; onOpen: () => void }) {
  return (
    <div
      data-testid="story-frame"
      style={{
        opacity: revealed ? 1 : 0.12,
        filter: revealed ? 'none' : 'blur(3px)',
        transition: 'opacity 0.5s ease, filter 0.5s ease',
        border: `1.5px solid ${revealed ? '#C4714A40' : '#d4c8b8'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'rgba(255,253,249,0.8)',
      }}
    >
      <div
        style={{ aspectRatio: '4/3', background: '#e8e2d8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: revealed ? 'zoom-in' : 'default' }}
        onClick={revealed ? onOpen : undefined}
      >
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
      <div style={{ padding: '5px 8px', borderTop: '1px solid #e8e2d8' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#C4714A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
          {frame.num} {frame.sub}
        </p>
        <p style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#1A1A1A', lineHeight: 1.2 }}>
          {frame.caption}
        </p>
      </div>
    </div>
  )
}

const x402Labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

function ImageModal({ frame, onClose }: { frame: typeof frames[0]; onClose: () => void }) {
  const idx = frames.indexOf(frame)
  const frameNum = idx + 1
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
        gap: '24px',
      }}
    >
      <img
        src={frame.img}
        alt={frame.caption}
        style={{ maxWidth: '82vw', maxHeight: '58vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}
      />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px',
          padding: '20px 32px',
          maxWidth: '720px',
          width: 'calc(100% - 48px)',
        }}
      >
        <div style={{ textAlign: 'center', minWidth: 0 }}>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#C4714A', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>
            아이폰 비유
          </p>
          <p style={{ fontFamily: 'sans-serif', fontSize: '22px', color: '#fff', lineHeight: 1.3 }}>
            <span style={{ fontFamily: 'monospace', color: '#C4714A', marginRight: '8px' }}>{frameNum}.</span>
            {frame.caption}
          </p>
        </div>

        <div style={{ fontSize: '28px', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>→</div>

        <div style={{ textAlign: 'center', minWidth: 0 }}>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#7A9E87', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>
            x402
          </p>
          <p style={{
            fontFamily: 'monospace', fontSize: '20px', lineHeight: 1.3,
            color: frame.highlight ? '#C4714A' : '#7ECBA1',
            fontWeight: frame.highlight ? 600 : 400,
          }}>
            <span style={{ color: '#7A9E87', marginRight: '8px' }}>{x402Labels[idx]}.</span>
            {frame.x402}
          </p>
        </div>
      </div>

      <p style={{ fontFamily: 'sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
        화면 아무 곳이나 클릭하면 닫힙니다
      </p>
    </div>
  )
}

const Slide07IphoneStory = ({ animKey, step = 0 }: Props) => {
  const [modalFrame, setModalFrame] = useState<typeof frames[0] | null>(null)

  return (
    <div className="slide bg-beige content-z-index" style={step > 0 ? { padding: '2vh 2vw' } : undefined}>
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
        <div key={`${animKey}-grid`} className="fade-in-stagger content-z-index" style={{ width: '96%' }}>
          <div className="w-full grid grid-cols-4 gap-2">
            {frames.map((f, i) => (
              <StoryFrame key={f.num} frame={f} revealed={step > i} onOpen={() => setModalFrame(f)} />
            ))}
          </div>
        </div>
      )}

      {modalFrame && createPortal(
        <ImageModal frame={modalFrame} onClose={() => setModalFrame(null)} />,
        document.body
      )}
    </div>
  )
}

export default Slide07IphoneStory
