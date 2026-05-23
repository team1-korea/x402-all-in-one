import { useState } from 'react'
import { createPortal } from 'react-dom'

interface Props { animKey: number; step?: number }

const frames = [
  { num: '①', sub: '욕구 발생',  caption: '아 이 책 읽고 싶다',     img: '/story-01-desire.png',   x402: '구매 필요 확인',          highlight: false, customScene: false },
  { num: '②', sub: '탐색',      caption: '서점에서 책 찾기',        img: '/story-02-explore.png',  x402: 'llms.txt 확인',           highlight: false, customScene: true  },
  { num: '③', sub: '요청',      caption: '"이 책 주세요"',           img: '/story-03-request.png',  x402: '전자책 다운로드 요청',    highlight: false, customScene: false },
  { num: '④', sub: '결제 요구', caption: '"결제해주세요"',           img: '/story-04-payment.png',  x402: '402 — 결제 필요',         highlight: true,  customScene: false },
  { num: '⑤', sub: '서명',      caption: '카드 꽂기',               img: '/story-05-sign.png',     x402: '결제 서명 & 재요청',      highlight: false, customScene: false },
  { num: '⑥', sub: '승인',      caption: '카드사 처리',             img: '/story-06-approve.png',  x402: '결제 검증 & 승인',        highlight: false, customScene: false },
  { num: '⑦', sub: '수령',      caption: '책 수령!',                img: '/story-07-receive.png',  x402: '전자책 PDF 링크 수신',    highlight: false, customScene: false },
]

function BookSearchScene() {
  return (
    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* 배경 */}
      <rect width="400" height="300" fill="#f5f0e8" />

      {/* 모니터 스탠드 */}
      <rect x="188" y="222" width="24" height="26" fill="#8a8080" />
      <rect x="155" y="246" width="90" height="10" rx="5" fill="#7a7070" />

      {/* 모니터 베젤 */}
      <rect x="52" y="42" width="296" height="184" rx="10" fill="#3a3a3a" />

      {/* 화면 */}
      <rect x="65" y="54" width="270" height="160" rx="3" fill="#f8faf8" />

      {/* 검색창 */}
      <rect x="82" y="68" width="210" height="22" rx="11" fill="white" stroke="#d0d0d0" strokeWidth="1.5" />
      <text x="155" y="83" fontSize="11" fill="#bbb" textAnchor="middle">책 제목으로 검색</text>
      <circle cx="282" cy="79" r="7" fill="none" stroke="#bbb" strokeWidth="1.5" />
      <line x1="287" y1="84" x2="292" y2="89" stroke="#bbb" strokeWidth="1.5" />

      {/* 검색 결과 */}
      <rect x="82" y="102" width="238" height="22" rx="3" fill="white" stroke="#e5e5e5" strokeWidth="1" />
      <text x="90" y="117" fontSize="10" fill="#999">A-301  클린 코드</text>

      {/* B-402 강조 행 */}
      <rect x="82" y="127" width="238" height="24" rx="3" fill="#fff3e0" stroke="#e8a030" strokeWidth="1.5" />
      <text x="90" y="143" fontSize="10" fill="#b06000" fontWeight="bold">B-402  x402 프로토콜 완전 가이드</text>

      <rect x="82" y="154" width="238" height="22" rx="3" fill="white" stroke="#e5e5e5" strokeWidth="1" />
      <text x="90" y="169" fontSize="10" fill="#999">C-215  블록체인 입문</text>

      {/* 말풍선 */}
      <rect x="248" y="4" width="140" height="46" rx="10" fill="white" stroke="#C4714A" strokeWidth="2" />
      {/* 꼬리 (모니터 화면 상단을 향해) */}
      <polygon points="272,50 260,66 294,50" fill="white" />
      <line x1="260" y1="66" x2="272" y2="50" stroke="#C4714A" strokeWidth="2" />
      <line x1="260" y1="66" x2="294" y2="50" stroke="#C4714A" strokeWidth="2" />

      <text x="318" y="24" fontSize="13" textAnchor="middle" fill="#C4714A" fontWeight="bold">B-402에</text>
      <text x="318" y="42" fontSize="13" textAnchor="middle" fill="#C4714A" fontWeight="bold">있습니다 📚</text>
    </svg>
  )
}

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
        {frame.customScene ? (
          <BookSearchScene />
        ) : (
          <>
            <img
              src={frame.img}
              alt={frame.caption}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <span style={{ fontFamily: 'serif', fontSize: '2rem', opacity: 0.25, position: 'relative', zIndex: 1 }}>
              {frame.num}
            </span>
          </>
        )}
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
      {frame.customScene ? (
        <div style={{ maxWidth: '82vw', maxHeight: '58vh', width: '640px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}>
          <BookSearchScene />
        </div>
      ) : (
        <img
          src={frame.img}
          alt={frame.caption}
          style={{ maxWidth: '82vw', maxHeight: '58vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}
        />
      )}
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
            서점 비유
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
            06 · Theory — 서점 비유
          </p>
          <h2 className="fade-in-stagger font-serif text-6xl text-dark" style={{ animationDelay: '0.2s' }}>
            책 사러 서점 가기
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
