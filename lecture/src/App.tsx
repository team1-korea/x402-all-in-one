import { useState, useEffect } from 'react'
import './index.css'
import Slide01Title from './slides/Slide01Title'
import Slide02Agenda from './slides/Slide02Agenda'
import Slide03Skills from './slides/Slide03Skills'
import Slide04Install from './slides/Slide04Install'
import Slide05Verify from './slides/Slide05Verify'
import Slide06OpenGuide from './slides/Slide06OpenGuide'
import Slide07IphoneStory from './slides/Slide07IphoneStory'
import Slide08Comparison from './slides/Slide08Comparison'
import Slide09Hints from './slides/Slide09Hints'
import Slide10Test from './slides/Slide10Test'
import Slide11Go from './slides/Slide11Go'
import Slide12Quests from './slides/Slide12Quests'
import Slide13Leaderboard from './slides/Slide13Leaderboard'
import Slide14Bonus from './slides/Slide14Bonus'

const TOTAL_SLIDES = 14
// step 수: 0이면 step-through 없음, n이면 n번 눌러야 다음 슬라이드로
const STEP_COUNTS = [0, 3, 0, 0, 0, 7, 0, 0, 4, 0, 0, 0, 0, 0]

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentSteps, setCurrentSteps] = useState(() => Array(TOTAL_SLIDES).fill(0))
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [isClicking, setIsClicking] = useState(false)
  const [animKeys, setAnimKeys] = useState(() => Array(TOTAL_SLIDES).fill(0))

  const goTo = (next: number) => {
    setCurrentSlide(next)
    setAnimKeys(prev => prev.map((k, i) => (i === next ? k + 1 : k)))
    setCurrentSteps(prev => prev.map((s, i) => (i === next ? 0 : s)))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        const stepCount = STEP_COUNTS[currentSlide]
        const step = currentSteps[currentSlide]
        if (stepCount > 0 && step < stepCount) {
          setCurrentSteps(prev => prev.map((s, i) => (i === currentSlide ? s + 1 : s)))
        } else {
          const next = Math.min(currentSlide + 1, TOTAL_SLIDES - 1)
          if (next !== currentSlide) {
            setCurrentSlide(next)
            setAnimKeys(keys => keys.map((k, i) => (i === next ? k + 1 : k)))
            setCurrentSteps(prev => prev.map((s, i) => (i === next ? 0 : s)))
          }
        }
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const prev = Math.max(currentSlide - 1, 0)
        if (prev !== currentSlide) {
          setCurrentSlide(prev)
          setCurrentSteps(s => s.map((v, i) => (i === currentSlide || i === prev ? 0 : v)))
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentSlide, currentSteps])

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
      <div
        className={`custom-cursor ${isClicking ? 'active' : ''}`}
        style={{ transform: `translate(${cursorPos.x - 16}px, ${cursorPos.y - 16}px)` }}
      />

      <div
        className="slides-container"
        style={{
          width: `${TOTAL_SLIDES * 100}vw`,
          transform: `translateX(-${currentSlide * 100}vw)`,
        }}
      >
        <Slide01Title animKey={animKeys[0]} />
        <Slide02Agenda animKey={animKeys[1]} step={currentSteps[1]} />
        <Slide03Skills animKey={animKeys[2]} />
        <Slide04Install animKey={animKeys[3]} />
        <Slide05Verify animKey={animKeys[4]} />
        <Slide07IphoneStory animKey={animKeys[5]} step={currentSteps[5]} />
        <Slide08Comparison animKey={animKeys[6]} />
        <Slide06OpenGuide animKey={animKeys[7]} />
        <Slide09Hints animKey={animKeys[8]} step={currentSteps[8]} />
        <Slide10Test animKey={animKeys[9]} />
        <Slide11Go animKey={animKeys[10]} />
        <Slide12Quests animKey={animKeys[11]} />
        <Slide13Leaderboard animKey={animKeys[12]} />
        <Slide14Bonus animKey={animKeys[13]} />
      </div>

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

      <div className="absolute top-5 right-7 font-mono text-xs text-sage opacity-60 z-50 tracking-wide">
        {currentSlide + 1} / {TOTAL_SLIDES}
      </div>
    </div>
  )
}

export default App
