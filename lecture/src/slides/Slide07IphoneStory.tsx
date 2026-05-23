import React, { useState } from 'react'
import { createPortal } from 'react-dom'

interface Props { animKey: number; step?: number }

const llmsTxtContent = `# x402 Avalanche L1 — 빌더 밋업

> USDC(EIP-3009)으로 결제합니다.
> API 키 없음, 가입 없음.

## 네트워크 정보

Chain ID    : 402
네트워크    : Avalanche APIX L1 Testnet
Facilitator : https://unloc.kr/facilitator
USDC Token  : 0x65e1ec07cdc00f18e11dd0370c6158029f61721e

## 동작 방식

결제 없이 유료 엔드포인트를 호출하면
서버는 HTTP 402와 결제 요건을 반환합니다.
에이전트가 X-PAYMENT 헤더에 서명된 결제를 담아
재요청하면 퀘스트 URL을 반환합니다.

## 퀘스트 목록

| # | 퀘스트                      | 가격    |
|---|-----------------------------|---------|
| 1 | 드래그앤드롭 — x402 흐름    | 10 USDC |
| 2 | OX — Claude 스킬            | 10 USDC |
| 3 | OX — x402 프로토콜          | 10 USDC |
| 4 | 게임 — 합의를 방해하라      | 10 USDC |
| 5 | 객관식 — Claude 모델        | 10 USDC |
`

const frames = [
  { num: '①', sub: '욕구 발생',  caption: '아 이 책 읽고 싶다',  img: '/1.png', x402: '유료 리소스 접근 필요 인식',              highlight: false, hasLlmsPreview: false },
  { num: '②', sub: '탐색',      caption: '서점에서 책 찾기',     img: '/2.png', x402: 'llms.txt — endpoint · 가격 파악',         highlight: false, hasLlmsPreview: true  },
  { num: '③', sub: '요청',      caption: '"이 책 주세요"',        img: '/3.png', x402: 'GET /ebook/123 (결제 없이 첫 호출)',       highlight: false, hasLlmsPreview: false },
  { num: '④', sub: '결제 요구', caption: '"결제해주세요"',        img: '/4.png', x402: 'HTTP 402 + chain / amount / payTo',        highlight: true,  hasLlmsPreview: false },
  { num: '⑤', sub: '서명',      caption: '카드 꽂기',            img: '/5.png', x402: 'EIP-3009 서명 → X-PAYMENT 헤더',          highlight: false, hasLlmsPreview: false },
  { num: '⑥', sub: '승인',      caption: '카드사 처리',          img: '/6.png', x402: 'Facilitator: 서명 검증 + 온체인 정산',     highlight: false, hasLlmsPreview: false },
  { num: '⑦', sub: '수령',      caption: '책 수령!',             img: '/7.png', x402: '200 OK — 전자책 URL 반환',                 highlight: false, hasLlmsPreview: false },
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

const navBtn: React.CSSProperties = {
  flexShrink: 0, width: 48, height: 48,
  borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.08)', color: '#fff',
  fontSize: '20px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.15s',
}

function ImageModal({ frame, onClose, onPrev, onNext }: {
  frame: typeof frames[0]
  onClose: () => void
  onPrev: (() => void) | null
  onNext: (() => void) | null
}) {
  const [llmsOpen, setLlmsOpen] = useState(false)
  const idx = frames.indexOf(frame)
  const frameNum = idx + 1
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.97)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out', gap: '20px',
      }}
    >
      {/* 이미지 + 좌우 화살표 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
        <button
          style={{ ...navBtn, opacity: onPrev ? 1 : 0.2, cursor: onPrev ? 'pointer' : 'default' }}
          onClick={() => onPrev?.()}
          disabled={!onPrev}
        >←</button>
        <img
          src={frame.img}
          alt={frame.caption}
          style={{ maxWidth: '72vw', maxHeight: '55vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}
        />
        <button
          style={{ ...navBtn, opacity: onNext ? 1 : 0.2, cursor: onNext ? 'pointer' : 'default' }}
          onClick={() => onNext?.()}
          disabled={!onNext}
        >→</button>
      </div>

      {/* 3분할 비교 박스 */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', maxWidth: '740px', width: 'calc(100% - 48px)' }}
      >
        <div style={{
          flex: 1, padding: '16px 20px', textAlign: 'center',
          background: 'rgba(196,113,74,0.08)', border: '1px solid rgba(196,113,74,0.25)',
          borderRadius: '12px 0 0 12px',
        }}>
          <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#C4714A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            서점 비유
          </p>
          <p style={{ fontFamily: 'sans-serif', fontSize: '18px', color: '#fff', lineHeight: 1.3 }}>
            <span style={{ fontFamily: 'monospace', color: '#C4714A', marginRight: '6px' }}>{frameNum}.</span>
            {frame.caption}
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 20px', flexShrink: 0,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderLeft: 'none', borderRight: 'none',
        }}>
          <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }}>→</span>
        </div>

        <div
          style={{
            flex: 1, padding: '16px 20px', textAlign: 'center',
            background: 'rgba(122,158,135,0.08)', border: '1px solid rgba(122,158,135,0.25)',
            borderRadius: '0 12px 12px 0',
            cursor: frame.hasLlmsPreview ? 'pointer' : 'default',
            transition: 'background 0.15s',
          }}
          onClick={frame.hasLlmsPreview ? () => setLlmsOpen(true) : undefined}
          onMouseEnter={e => { if (frame.hasLlmsPreview) (e.currentTarget as HTMLDivElement).style.background = 'rgba(122,158,135,0.18)' }}
          onMouseLeave={e => { if (frame.hasLlmsPreview) (e.currentTarget as HTMLDivElement).style.background = 'rgba(122,158,135,0.08)' }}
        >
          <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#7A9E87', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            x402
          </p>
          <p style={{
            fontFamily: 'monospace', fontSize: '18px', lineHeight: 1.3,
            color: frame.highlight ? '#C4714A' : '#7ECBA1',
            fontWeight: frame.highlight ? 600 : 400,
          }}>
            <span style={{ color: '#7A9E87', marginRight: '6px' }}>{x402Labels[idx]}.</span>
            {frame.x402}
          </p>
          {frame.hasLlmsPreview && (
            <p style={{ fontFamily: 'sans-serif', fontSize: '11px', color: '#7A9E87', marginTop: '8px', opacity: 0.7 }}>
              파일 보기 →
            </p>
          )}
        </div>
      </div>

      <p style={{ fontFamily: 'sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
        {frameNum} / {frames.length} · 화면 아무 곳이나 클릭하면 닫힙니다
      </p>

      {llmsOpen && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.75)',
          }}
          onClick={() => setLlmsOpen(false)}
        >
          <div
            style={{
              background: '#1e2a1e', borderRadius: '1rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)', maxWidth: '680px',
              width: 'calc(100% - 48px)', maxHeight: '78vh', display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#7A9E87', fontWeight: 600 }}>llms.txt</span>
                <span style={{ fontFamily: 'sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '4px' }}>AI 에이전트용 서비스 설명서</span>
              </div>
              <button
                style={{ fontFamily: 'sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setLlmsOpen(false)}
              >닫기 ✕</button>
            </div>
            <pre style={{ overflowY: 'auto', padding: '20px 24px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13px', lineHeight: 1.7, color: 'rgba(187,247,208,0.8)', whiteSpace: 'pre-wrap', margin: 0 }}>
              {llmsTxtContent}
            </pre>
            <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <span style={{ fontFamily: 'sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>화면 아무 곳이나 클릭하면 닫힙니다</span>
            </div>
          </div>
        </div>,
        document.body
      )}
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
        <ImageModal
          frame={modalFrame}
          onClose={() => setModalFrame(null)}
          onPrev={(() => {
            const idx = frames.indexOf(modalFrame)
            return idx > 0 ? () => setModalFrame(frames[idx - 1]) : null
          })()}
          onNext={(() => {
            const idx = frames.indexOf(modalFrame)
            return idx < frames.length - 1 ? () => setModalFrame(frames[idx + 1]) : null
          })()}
        />,
        document.body
      )}
    </div>
  )
}

export default Slide07IphoneStory
