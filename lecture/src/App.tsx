import { useState, useEffect } from 'react'
import './index.css'
import Slide01Title from './slides/Slide01Title'
import Slide02Agenda from './slides/Slide02Agenda'
import Slide03Skills from './slides/Slide03Skills'
import Slide04Install from './slides/Slide04Install'
import Slide05Explore from './slides/Slide05Explore'
import Slide06IphoneStory from './slides/Slide06IphoneStory'
import Slide07Comparison from './slides/Slide07Comparison'
import Slide08Hints from './slides/Slide08Hints'
import Slide09Test from './slides/Slide09Test'
import Slide10Go from './slides/Slide10Go'
import Slide11Quests from './slides/Slide11Quests'
import Slide12Leaderboard from './slides/Slide12Leaderboard'
import Slide13Bonus from './slides/Slide13Bonus'

const TOTAL_SLIDES = 13

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [isClicking, setIsClicking] = useState(false)
  const [animKeys, setAnimKeys] = useState(() => Array(TOTAL_SLIDES).fill(0))

  const goTo = (next: number) => {
    setCurrentSlide(next)
    setAnimKeys(prev => prev.map((k, i) => (i === next ? k + 1 : k)))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        setCurrentSlide(prev => {
          const next = Math.min(prev + 1, TOTAL_SLIDES - 1)
          setAnimKeys(keys => keys.map((k, i) => (i === next ? k + 1 : k)))
          return next
        })
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentSlide(prev => Math.max(prev - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY })
    const onDown = () => setIsClicking(true)
    const onUp = () => setIsClicking(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <div className="w-screen h-screen overflow-hidden bg-beige relative selection:bg-terracotta selection:text-cream">
      {/* Custom cursor */}
      <div
        className={`custom-cursor ${isClicking ? 'active' : ''}`}
        style={{ transform: `translate(${cursorPos.x - 16}px, ${cursorPos.y - 16}px)` }}
      />

      {/* Slides container */}
      <div
        className="slides-container"
        style={{
          width: `${TOTAL_SLIDES * 100}vw`,
          transform: `translateX(-${currentSlide * 100}vw)`,
        }}
      >
        <Slide01Title animKey={animKeys[0]} />
        <Slide02Agenda animKey={animKeys[1]} />
        <Slide03Skills animKey={animKeys[2]} />
        <Slide04Install animKey={animKeys[3]} />
        <Slide05Explore animKey={animKeys[4]} />
        <Slide06IphoneStory animKey={animKeys[5]} />
        <Slide07Comparison animKey={animKeys[6]} />
        <Slide08Hints animKey={animKeys[7]} />
        <Slide09Test animKey={animKeys[8]} />
        <Slide10Go animKey={animKeys[9]} />
        <Slide11Quests animKey={animKeys[10]} />
        <Slide12Leaderboard animKey={animKeys[11]} />
        <Slide13Bonus animKey={animKeys[12]} />
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-50">
        {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
          <button
            key={idx}
            aria-label={`슬라이드 ${idx + 1}`}
            onClick={() => goTo(idx)}
            className={`w-2 h-2 rounded-full border-0 p-0 transition-all duration-500 cursor-none ${
              currentSlide === idx
                ? 'bg-terracotta scale-125'
                : 'bg-sage opacity-30 hover:opacity-100'
            }`}
          />
        ))}
      </div>

      {/* Slide number */}
      <div className="absolute top-5 right-7 font-mono text-xs text-sage opacity-60 z-50 tracking-wide">
        {currentSlide + 1} / {TOTAL_SLIDES}
      </div>
    </div>
  )
}

export default App
