import { useState } from 'react'

interface Props { animKey: number }

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'https://x402.abcfe.net'

const Slide11Go = ({ animKey }: Props) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const startMarathon = async () => {
    setStatus('loading')
    try {
      await fetch(`${SERVER_URL}/v1/marathon/start`, { method: 'POST' })
      setStatus('done')
    } catch {
      setStatus('idle')
    }
  }

  return (
    <div className="slide bg-beige content-z-index">
      <div className="ambient-shape bg-terracotta" style={{ width: '60vw', height: '60vw', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.04, animationDelay: '-1s' }} />
      <div key={animKey} className="flex flex-col items-center w-full content-z-index">
        <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-6" style={{ animationDelay: '0s' }}>Marathon</p>
        <div className="fade-in-stagger font-serif text-[12vw] font-bold text-terracotta leading-none mb-2" style={{ animationDelay: '0.2s' }}>
          GO
        </div>
        <div className="fade-in-stagger font-mono text-lg tracking-[0.3em] uppercase text-sage mb-8" style={{ animationDelay: '0.6s' }}>
          QUEST MARATHON
        </div>
        <pre className="fade-in-stagger bg-[#1e2d24] rounded-xl px-10 py-5 font-mono text-2xl text-[#d4ede0] text-center mb-6" style={{ animationDelay: '0.9s' }}>
          /x402-quest
        </pre>

        {/* 100 USDC 가이드 */}
        <div className="fade-in-stagger flex flex-col items-center gap-3 w-full max-w-2xl mb-6" style={{ animationDelay: '1.1s' }}>
          <div className="bg-terracotta/10 border border-terracotta/30 rounded-xl px-8 py-3 font-mono text-lg text-terracotta font-semibold">
            100 USDC 에어드랍
          </div>
          <span className="text-sage/50 text-xl">↓</span>
          <div className="flex gap-2 flex-wrap justify-center">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="bg-cream/80 border border-sage/20 rounded-lg px-3 py-2 flex flex-col items-center"
              >
                <span className="font-mono text-xs text-sage">Q{i + 1}</span>
                <span className="font-mono text-sm text-dark font-medium">10</span>
                <span className="font-mono text-xs text-sage/60">USDC</span>
              </div>
            ))}
          </div>
          <p className="font-sans text-sm text-sage/70 mt-1">10개 퀘스트 × 10 USDC — 100 USDC로 딱 완주</p>
        </div>

        {/* 마라톤 시작 버튼 */}
        <div className="fade-in-stagger" style={{ animationDelay: '1.3s' }}>
          {status === 'done' ? (
            <div className="bg-forest/10 border border-forest/30 rounded-xl px-10 py-4 font-mono text-lg text-forest font-semibold">
              ✓ 마라톤 시작됨 — 참가자 화면이 열렸습니다
            </div>
          ) : (
            <button
              onClick={startMarathon}
              disabled={status === 'loading'}
              className="bg-terracotta hover:bg-terracotta/85 disabled:opacity-50 text-cream font-sans font-semibold text-xl px-12 py-4 rounded-xl transition-all duration-150 cursor-none"
            >
              {status === 'loading' ? '시작 중...' : '🏁 마라톤 시작하기'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Slide11Go
