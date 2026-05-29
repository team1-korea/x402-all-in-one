# Lecture Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `lecture/index.html` with a Vite+React slide deck using the warm beige design system from idea-stage-fe.

**Architecture:** Vite+React project in `lecture/`. `App.tsx` manages navigation (translateX), custom cursor, and per-slide animation keys. 13 slide components in `src/slides/`. Shared design tokens via CSS variables + Tailwind custom colors.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Google Fonts (Playfair Display, Outfit, JetBrains Mono), Vitest + React Testing Library

---

## File Map

| File | Role |
|---|---|
| `lecture/index.html` | Entry — loads fonts from Google, mounts `#root` |
| `lecture/package.json` | Dependencies |
| `lecture/vite.config.ts` | Vite + Vitest config |
| `lecture/tailwind.config.js` | Custom color tokens |
| `lecture/postcss.config.js` | Tailwind/autoprefixer pipeline |
| `lecture/tsconfig.json` + `tsconfig.app.json` | TypeScript config |
| `lecture/src/main.tsx` | React root mount |
| `lecture/src/App.tsx` | Navigation, cursor, dot indicators, slide keys |
| `lecture/src/index.css` | CSS vars, keyframes, utility classes |
| `lecture/src/slides/Slide01Title.tsx` | 타이틀 슬라이드 |
| `lecture/src/slides/Slide02Agenda.tsx` | 오늘 할 것들 |
| `lecture/src/slides/Slide03Skills.tsx` | Claude Skills란? |
| `lecture/src/slides/Slide04Install.tsx` | 스킬 설치 |
| `lecture/src/slides/Slide05Explore.tsx` | 구멍 공개 |
| `lecture/src/slides/Slide06IphoneStory.tsx` | 아이폰 스토리 플로우 |
| `lecture/src/slides/Slide07Comparison.tsx` | x402 대응표 |
| `lecture/src/slides/Slide08Hints.tsx` | 구멍 채우기 힌트표 |
| `lecture/src/slides/Slide09Test.tsx` | 테스트 CTA |
| `lecture/src/slides/Slide10Go.tsx` | 퀘스트 마라톤 GO |
| `lecture/src/slides/Slide11Quests.tsx` | 퀘스트 구성 |
| `lecture/src/slides/Slide12Leaderboard.tsx` | 순위판 |
| `lecture/src/slides/Slide13Bonus.tsx` | 보너스 |
| `lecture/src/App.test.tsx` | Navigation logic tests |

---

## Task 1: Project Scaffold

**Files:**
- Create: `lecture/index.html`
- Create: `lecture/package.json`
- Create: `lecture/vite.config.ts`
- Create: `lecture/tailwind.config.js`
- Create: `lecture/postcss.config.js`
- Create: `lecture/tsconfig.json`
- Create: `lecture/tsconfig.app.json`
- Create: `lecture/src/main.tsx`

- [ ] **Step 1: Back up existing index.html**

```bash
cp lecture/index.html lecture/index.html.bak
```

- [ ] **Step 2: Create `lecture/index.html`**

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>금쪽같은 내 클로드의 첫 결제 — x402</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `lecture/package.json`**

```json
{
  "name": "x402-lecture",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.5.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.3"
  }
}
```

- [ ] **Step 4: Create `lecture/vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
})
```

- [ ] **Step 5: Create `lecture/tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        beige: '#F5F0E8',
        terracotta: '#C4714A',
        forest: '#3D6B4F',
        sage: '#7A9E87',
        cream: '#FFFDF9',
        dark: '#1A1A1A',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 6: Create `lecture/postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Create `lecture/tsconfig.json`**

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }]
}
```

- [ ] **Step 8: Create `lecture/tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

- [ ] **Step 9: Create `lecture/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 10: Create `lecture/src/setupTests.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 11: Install dependencies**

```bash
cd lecture && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 12: Commit**

```bash
git add lecture/index.html lecture/package.json lecture/vite.config.ts lecture/tailwind.config.js lecture/postcss.config.js lecture/tsconfig.json lecture/tsconfig.app.json lecture/src/main.tsx lecture/src/setupTests.ts
git commit -m "feat(lecture): scaffold Vite+React project"
```

---

## Task 2: Design System

**Files:**
- Create: `lecture/src/index.css`

- [ ] **Step 1: Create `lecture/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-beige: #F5F0E8;
  --color-terracotta: #C4714A;
  --color-forest: #3D6B4F;
  --color-sage: #7A9E87;
  --color-cream: #FFFDF9;
  --color-dark: #1A1A1A;
  --font-serif: 'Playfair Display', serif;
  --font-sans: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  background-color: var(--color-beige);
  color: var(--color-dark);
  overflow: hidden;
  cursor: none;
  -webkit-font-smoothing: antialiased;
}

/* Slide layout */
.slides-container {
  display: flex;
  height: 100vh;
  transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1);
  will-change: transform;
}

.slide {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  padding: 5% 8%;
}

.content-z-index {
  position: relative;
  z-index: 10;
}

/* Custom cursor */
.custom-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(196, 113, 74, 0.4) 0%, rgba(196, 113, 74, 0) 70%);
  transition: width 0.3s ease, height 0.3s ease, background 0.3s ease;
  mix-blend-mode: multiply;
  will-change: left, top, width, height, background;
}

.custom-cursor.active {
  width: 48px;
  height: 48px;
  background: radial-gradient(circle, rgba(122, 158, 135, 0.5) 0%, rgba(122, 158, 135, 0) 70%);
}

/* Animations */
.fade-in-stagger {
  opacity: 0;
  transform: translateY(10px);
  animation: gentleFadeUp 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes gentleFadeUp {
  to { opacity: 1; transform: translateY(0); }
}

.bloom-effect {
  opacity: 0;
  transform: scale(0.95);
  animation: bloomPulse 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes bloomPulse {
  50% { opacity: 1; transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
}

/* Ambient background shapes */
.ambient-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
  animation: breatheShape 12s ease-in-out infinite alternate;
  will-change: transform, opacity;
}

@keyframes breatheShape {
  0% { transform: scale(1) translate(0, 0); opacity: 0.3; }
  100% { transform: scale(1.2) translate(5%, -5%); opacity: 0.5; }
}
```

- [ ] **Step 2: Commit**

```bash
git add lecture/src/index.css
git commit -m "feat(lecture): add design system CSS (tokens, keyframes, layout)"
```

---

## Task 3: App.tsx + Navigation Tests

**Files:**
- Create: `lecture/src/App.tsx`
- Create: `lecture/src/App.test.tsx`

- [ ] **Step 1: Write failing tests first**

Create `lecture/src/App.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

// Stub all slide components so tests don't care about their internals
vi.mock('./slides/Slide01Title', () => ({ default: () => <div data-testid="slide-0" /> }))
vi.mock('./slides/Slide02Agenda', () => ({ default: () => <div data-testid="slide-1" /> }))
vi.mock('./slides/Slide03Skills', () => ({ default: () => <div data-testid="slide-2" /> }))
vi.mock('./slides/Slide04Install', () => ({ default: () => <div data-testid="slide-3" /> }))
vi.mock('./slides/Slide05Explore', () => ({ default: () => <div data-testid="slide-4" /> }))
vi.mock('./slides/Slide06IphoneStory', () => ({ default: () => <div data-testid="slide-5" /> }))
vi.mock('./slides/Slide07Comparison', () => ({ default: () => <div data-testid="slide-6" /> }))
vi.mock('./slides/Slide08Hints', () => ({ default: () => <div data-testid="slide-7" /> }))
vi.mock('./slides/Slide09Test', () => ({ default: () => <div data-testid="slide-8" /> }))
vi.mock('./slides/Slide10Go', () => ({ default: () => <div data-testid="slide-9" /> }))
vi.mock('./slides/Slide11Quests', () => ({ default: () => <div data-testid="slide-10" /> }))
vi.mock('./slides/Slide12Leaderboard', () => ({ default: () => <div data-testid="slide-11" /> }))
vi.mock('./slides/Slide13Bonus', () => ({ default: () => <div data-testid="slide-12" /> }))

describe('App navigation', () => {
  beforeEach(() => {
    render(<App />)
  })

  it('renders 13 dot indicators', () => {
    expect(screen.getAllByRole('button', { hidden: true })).toHaveLength(13)
  })

  it('shows slide 1 / 13 initially', () => {
    expect(screen.getByText('1 / 13')).toBeInTheDocument()
  })

  it('ArrowRight advances to slide 2', () => {
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('2 / 13')).toBeInTheDocument()
  })

  it('ArrowLeft does not go below slide 1', () => {
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('1 / 13')).toBeInTheDocument()
  })

  it('does not exceed slide 13 on ArrowRight spam', () => {
    for (let i = 0; i < 20; i++) fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('13 / 13')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — expect failure (modules not found)**

```bash
cd lecture && npm test
```

Expected: FAIL — `Cannot find module './slides/Slide01Title'`

- [ ] **Step 3: Create stub slide files so tests resolve**

Create each of these 13 files with the minimal content below. Replace `Slide01Title` / `slide-0` with the correct name and index for each:

```tsx
// lecture/src/slides/Slide01Title.tsx
interface Props { isActive: boolean; animKey: number }
const Slide01Title: React.FC<Props> = () => <div className="slide" />
export default Slide01Title
```

Repeat for `Slide02Agenda` through `Slide13Bonus`, incrementing only the name. All stubs are identical except the component name.

- [ ] **Step 4: Create `lecture/src/App.tsx`**

```tsx
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

  const goTo = (n: number) => {
    const next = Math.max(0, Math.min(n, TOTAL_SLIDES - 1))
    setCurrentSlide(next)
    setAnimKeys(prev => prev.map((k, i) => (i === next ? k + 1 : k)))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(currentSlide + 1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentSlide - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentSlide])

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
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* Slides container */}
      <div
        className="slides-container"
        style={{
          width: `${TOTAL_SLIDES * 100}vw`,
          transform: `translateX(-${currentSlide * 100}vw)`,
        }}
      >
        <Slide01Title isActive={currentSlide === 0} animKey={animKeys[0]} />
        <Slide02Agenda isActive={currentSlide === 1} animKey={animKeys[1]} />
        <Slide03Skills isActive={currentSlide === 2} animKey={animKeys[2]} />
        <Slide04Install isActive={currentSlide === 3} animKey={animKeys[3]} />
        <Slide05Explore isActive={currentSlide === 4} animKey={animKeys[4]} />
        <Slide06IphoneStory isActive={currentSlide === 5} animKey={animKeys[5]} />
        <Slide07Comparison isActive={currentSlide === 6} animKey={animKeys[6]} />
        <Slide08Hints isActive={currentSlide === 7} animKey={animKeys[7]} />
        <Slide09Test isActive={currentSlide === 8} animKey={animKeys[8]} />
        <Slide10Go isActive={currentSlide === 9} animKey={animKeys[9]} />
        <Slide11Quests isActive={currentSlide === 10} animKey={animKeys[10]} />
        <Slide12Leaderboard isActive={currentSlide === 11} animKey={animKeys[11]} />
        <Slide13Bonus isActive={currentSlide === 12} animKey={animKeys[12]} />
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
```

- [ ] **Step 5: Run tests — expect pass**

```bash
cd lecture && npm test
```

Expected: 5 tests PASS.

- [ ] **Step 6: Verify dev server starts**

```bash
cd lecture && npm run dev
```

Expected: `http://localhost:5173` — blank beige page with dot indicators and slide number badge. No console errors.

- [ ] **Step 7: Commit**

```bash
git add lecture/src/App.tsx lecture/src/App.test.tsx lecture/src/slides/
git commit -m "feat(lecture): add App with navigation, cursor, animation keys + tests"
```

---

## Task 4: Slides 01–04

**Files:** Modify `lecture/src/slides/Slide01Title.tsx` through `Slide04Install.tsx`

Note: Each slide uses `animKey` as a React `key` on its content wrapper — this forces animation replay when the slide is navigated back to. `isActive` is accepted but not used in visual logic (reserved for future accessibility needs).

- [ ] **Step 1: Implement `Slide01Title.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const Slide01Title: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '40vw', height: '40vw', top: '-10%', right: '-5%', opacity: 0.04 }} />
    <div className="ambient-shape bg-forest" style={{ width: '35vw', height: '35vw', bottom: '-10%', left: '-8%', opacity: 0.05, animationDelay: '-4s' }} />
    <div key={animKey} className="flex flex-col items-center text-center gap-6 content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage" style={{ animationDelay: '0s' }}>
        Avalanche x402 Meetup · 2026.05.28
      </p>
      <h1 className="fade-in-stagger font-serif text-7xl md:text-8xl text-dark leading-tight" style={{ animationDelay: '0.3s' }}>
        금쪽같은 내 클로드의<br />
        <span className="text-terracotta">첫 결제</span>
        <span className="block font-sans font-light text-3xl text-sage mt-3">feat. x402</span>
      </h1>
      <p className="fade-in-stagger font-sans font-light text-xl text-sage" style={{ animationDelay: '1.0s' }}>
        Claude가 직접 돈을 내고 서비스를 사오는 구조를 만들어봅니다
      </p>
    </div>
  </div>
)

export default Slide01Title
```

- [ ] **Step 2: Implement `Slide02Agenda.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const items = [
  { text: <>Claude Skills로 <strong className="text-terracotta font-medium">x402 결제 능력</strong> 부여</>, sub: 'SKILL.md 파일 구멍 채우기', delay: '0.4s' },
  { text: <><strong className="text-terracotta font-medium">퀘스트 마라톤</strong> — 10개 완주</>, sub: '실시간 순위, Top 3 선물', delay: '1.0s' },
  { text: <>AI 에이전트가 <strong className="text-terracotta font-medium">내 플랫폼에 찾아와 구매</strong>하는 감각</>, sub: '오늘 자리를 뜨면 이 감각을 가져가세요', delay: '1.6s' },
]

const Slide02Agenda: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '50vw', height: '50vw', bottom: '-10%', right: '-10%', opacity: 0.07, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>01 · Agenda</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-10" style={{ animationDelay: '0.2s' }}>오늘 할 것들</h2>
      <div className="flex flex-col gap-4 w-full">
        {items.map(({ text, sub, delay }) => (
          <div key={delay} className="fade-in-stagger flex flex-col gap-1 bg-cream/60 rounded-lg px-5 py-4 border-l-2 border-terracotta" style={{ animationDelay: delay }}>
            <p className="font-sans text-lg text-dark">{text}</p>
            <p className="font-sans font-light text-sm text-sage">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Slide02Agenda
```

- [ ] **Step 3: Implement `Slide03Skills.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const Slide03Skills: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '45vw', height: '45vw', top: '-5%', right: '-8%', opacity: 0.04, animationDelay: '-6s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>02 · Claude Skills</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-6" style={{ animationDelay: '0.2s' }}>Claude Skills란?</h2>
      <p className="fade-in-stagger font-sans text-xl text-dark/80 mb-6" style={{ animationDelay: '0.5s' }}>
        <code className="bg-forest/10 px-2 py-0.5 rounded text-forest font-mono text-lg">/</code>
        {' '}를 입력하면 나오는 슬래시 명령어
      </p>
      <div className="fade-in-stagger w-full bg-cream/70 border border-forest/20 rounded-xl px-6 py-5 mb-6" style={{ animationDelay: '0.8s' }}>
        <p className="font-sans text-lg text-dark">
          <strong className="font-medium">.md 파일 하나</strong> = Claude에게 새 능력 부여
        </p>
        <p className="font-sans text-sm text-sage mt-2">
          코드가 아닙니다 — Claude에게 보내는{' '}
          <strong className="text-forest font-medium">자연어 지시문</strong>입니다
        </p>
      </div>
      <pre className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-5 font-mono text-sm text-[#d4ede0] text-left leading-7" style={{ animationDelay: '1.1s' }}>
{`---
name: x402-pay
description: x402 결제를 수행합니다.
---

# 결제 방법
1단계: 유료 엔드포인트에 GET 요청...
2단계: 402 응답을 받는다...   `}<span className="text-[#4a7c5f]">← Claude가 이걸 읽고 실행</span>
      </pre>
    </div>
  </div>
)

export default Slide03Skills
```

- [ ] **Step 4: Implement `Slide04Install.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const Slide04Install: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '38vw', height: '38vw', bottom: '-8%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>03 · Install</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>스킬 설치</h2>
      <pre className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-5 font-mono text-lg text-[#d4ede0] text-center mb-6" style={{ animationDelay: '0.5s' }}>
        npx x402-meetup --url=https://api.x402-meetup.example.com
      </pre>
      <div className="fade-in-stagger w-full bg-cream/70 border border-forest/20 rounded-xl px-6 py-5 mb-5 font-sans text-base text-dark/80" style={{ animationDelay: '0.9s' }}>
        설치 확인: Claude Code에서{' '}
        <code className="bg-forest/10 px-2 py-0.5 rounded text-forest font-mono text-sm">/</code>
        {' '}입력 →<br />
        <strong className="font-medium text-dark">x402-pay, x402-discover, x402-quest</strong>가 목록에 보이면 OK
      </div>
      <p className="fade-in-stagger font-sans text-sm text-sage" style={{ animationDelay: '1.2s' }}>
        VSCode 없으신 분 → vscode.dev 또는 메모장도 됩니다
      </p>
    </div>
  </div>
)

export default Slide04Install
```

- [ ] **Step 5: Run tests**

```bash
cd lecture && npm test
```

Expected: 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lecture/src/slides/Slide01Title.tsx lecture/src/slides/Slide02Agenda.tsx lecture/src/slides/Slide03Skills.tsx lecture/src/slides/Slide04Install.tsx
git commit -m "feat(lecture): implement slides 01-04 (title, agenda, skills, install)"
```

---

## Task 5: Slides 05–08

**Files:** Modify `Slide05Explore.tsx` through `Slide08Hints.tsx`

- [ ] **Step 1: Implement `Slide05Explore.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const holes = [
  '[TODO: 몇 번 응답을 돌려보내나요?]',
  '[TODO: 어떤 정보들이 들어있나요? (어느 체인, 얼마, 어느 지갑으로)]',
  '[TODO: 받는 지갑 주소는 응답의 어느 필드에서 가져오나요?]',
  '[TODO: 어떤 인코딩 방식으로 변환해야 하나요?]',
]

const Slide05Explore: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '42vw', height: '42vw', top: '-8%', left: '-5%', opacity: 0.06, animationDelay: '-5s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>04 · Explore</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-3" style={{ animationDelay: '0.2s' }}>
        <code className="font-mono text-4xl text-forest">x402-pay/SKILL.md</code> 열어보기
      </h2>
      <p className="fade-in-stagger font-sans font-light text-base text-sage mb-6" style={{ animationDelay: '0.5s' }}>
        흐름 설명 부분에 이런 빈칸들이 있습니다
      </p>
      <div className="fade-in-stagger flex flex-col gap-2 w-full" style={{ animationDelay: '0.7s' }}>
        {holes.map((h) => (
          <div key={h} className="w-full bg-[#1a0e2e]/5 border border-dashed border-[#7c3aed]/30 rounded-lg px-5 py-3 font-mono text-sm text-[#7c3aed]/80">
            {h}
          </div>
        ))}
      </div>
      <div className="fade-in-stagger w-full mt-5 bg-terracotta/5 border border-terracotta/25 rounded-xl px-6 py-4 font-sans text-sm text-terracotta/90" style={{ animationDelay: '1.2s' }}>
        이 구멍들이 채워져야 Claude가 실제로 결제할 수 있습니다
      </div>
    </div>
  </div>
)

export default Slide05Explore
```

- [ ] **Step 2: Implement `Slide06IphoneStory.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const steps = [
  { n: '1', text: '아 아이폰 사고 싶다 → 필요한 게 생겼다' },
  { n: '2', text: '애플스토어에서 목록 확인 → 원하는 것 찾기' },
  { n: '3', text: <>&#34;아이폰 13 주세요&#34; → <strong className="text-terracotta font-medium">원하는 것을 요청</strong></> },
  { n: '4', text: <><strong className="text-terracotta font-medium">&#34;결제해주세요&#34;</strong> → 얼마를, 어디로, 언제까지</> },
  { n: '5', text: <>카드 꽂기 → <strong className="text-terracotta font-medium">서명 생성</strong> + 다시 요청</> },
  { n: '6', text: '카드사 승인 → 검증 + 블록체인 정산' },
  { n: '7', text: <><strong className="text-terracotta font-medium">아이폰 수령</strong> → 서비스 응답</> },
]

const Slide06IphoneStory: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '45vw', height: '45vw', bottom: '-10%', right: '-10%', opacity: 0.07, animationDelay: '-4s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>05 · Theory — 아이폰 비유</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>아이폰 사러 애플스토어 가기</h2>
      <div className="fade-in-stagger flex flex-col gap-3 w-full" style={{ animationDelay: '0.5s' }}>
        {steps.map(({ n, text }) => (
          <div key={n} className="flex items-start gap-4">
            <div className="bg-forest text-[#d4ede0] w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs flex-shrink-0 mt-0.5">
              {n}
            </div>
            <p className="font-sans text-base text-dark leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Slide06IphoneStory
```

- [ ] **Step 3: Implement `Slide07Comparison.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const rows: [string, string, boolean][] = [
  ['"아이폰 13 주세요"', 'GET /v1/quest/{productId}/{step}', false],
  ['"결제해주세요"', 'HTTP 402 + accepts[0]', true],
  ['가격표 + 계좌번호', '체인 / 금액 / 수신 지갑', false],
  ['카드 꽂기', 'EIP-3009 서명 → X-PAYMENT 헤더', false],
  ['카드사 승인', 'facilitator: 검증 + 온체인 정산', false],
  ['아이폰 수령', '퀘스트 문제 응답', false],
]

const Slide07Comparison: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '40vw', height: '40vw', top: '-8%', left: '-5%', opacity: 0.04, animationDelay: '-7s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-3xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>05 · Theory — x402 대응표</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>x402 = 아이폰 구매 흐름</h2>
      <div className="fade-in-stagger w-full" style={{ display: 'grid', gridTemplateColumns: '1fr 2rem 1fr', animationDelay: '0.5s' }}>
        {/* Headers */}
        <div className="bg-forest/10 border border-forest/20 px-4 py-2 text-forest font-mono text-xs tracking-widest text-center rounded-tl-lg">아이폰 비유</div>
        <div />
        <div className="bg-terracotta/10 border border-terracotta/20 px-4 py-2 text-terracotta font-mono text-xs tracking-widest text-center rounded-tr-lg">x402</div>
        {/* Rows */}
        {rows.map(([left, right, highlight]) => (
          <>
            <div key={`l-${left}`} className="bg-cream/50 border border-sage/15 px-4 py-2.5 text-dark/70 text-sm flex items-center rounded-l-md my-0.5">{left}</div>
            <div key={`a-${left}`} className="flex items-center justify-center text-terracotta text-sm">↔</div>
            <div key={`r-${left}`} className={`border px-4 py-2.5 text-sm flex items-center rounded-r-md my-0.5 ${highlight ? 'bg-terracotta/10 border-terracotta/25 text-terracotta font-medium' : 'bg-cream/50 border-sage/15 text-forest/80'}`}>
              {right}
            </div>
          </>
        ))}
      </div>
    </div>
  </div>
)

export default Slide07Comparison
```

- [ ] **Step 4: Implement `Slide08Hints.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const hints = [
  ['①', '몇 번 응답?', '이 프로토콜 이름이기도 한 HTTP 상태 코드'],
  ['②', '응답에 뭐가 있나?', '체인, 금액, 수신 지갑 — "가격표 + 계좌번호"'],
  ['③', 'to 필드?', <><code className="bg-forest/10 px-1.5 py-0.5 rounded text-forest font-mono text-xs">accepts[0]</code>의 수신자 주소 필드명</>],
  ['④', 'value 필드?', <><code className="bg-forest/10 px-1.5 py-0.5 rounded text-forest font-mono text-xs">accepts[0]</code>의 금액 필드명</>],
  ['⑤', 'validBefore?', '지금 + maxTimeoutSeconds초'],
  ['⑥', '인코딩 방식?', 'JSON → 바이너리 → 텍스트'],
  ['⑦', '누가 검증?', '네트워크 정보 테이블에 있음'],
]

const Slide08Hints: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '35vw', height: '35vw', top: '-5%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-3" style={{ animationDelay: '0s' }}>06 · Lab</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-2" style={{ animationDelay: '0.2s' }}>구멍 채우기</h2>
      <p className="fade-in-stagger font-sans font-light text-sm text-sage mb-5" style={{ animationDelay: '0.4s' }}>
        x402-pay/SKILL.md 열고 [TODO] 부분을 자연어로 채우세요
      </p>
      <table className="fade-in-stagger w-full text-sm" style={{ animationDelay: '0.6s', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['#', '구멍', '힌트'].map(h => (
              <th key={h} className="bg-forest/8 text-forest font-mono text-xs tracking-wider uppercase px-4 py-2 text-left border-b border-forest/20">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hints.map(([n, hole, hint]) => (
            <tr key={String(n)} className="border-b border-sage/10">
              <td className="px-4 py-2 font-mono text-terracotta text-xs">{n}</td>
              <td className="px-4 py-2 text-dark/80 font-sans">{hole}</td>
              <td className="px-4 py-2 text-dark/70 font-sans">{hint}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="fade-in-stagger w-full mt-4 bg-forest/6 border border-forest/20 rounded-xl px-5 py-3 font-sans text-sm text-forest" style={{ animationDelay: '1.0s' }}>
        정확하지 않아도 됩니다 — 비슷한 의미면 Claude가 알아서 해석합니다
      </div>
    </div>
  </div>
)

export default Slide08Hints
```

- [ ] **Step 5: Run tests**

```bash
cd lecture && npm test
```

Expected: 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lecture/src/slides/Slide05Explore.tsx lecture/src/slides/Slide06IphoneStory.tsx lecture/src/slides/Slide07Comparison.tsx lecture/src/slides/Slide08Hints.tsx
git commit -m "feat(lecture): implement slides 05-08 (explore, flow, comparison, hints)"
```

---

## Task 6: Slides 09–13

**Files:** Modify `Slide09Test.tsx` through `Slide13Bonus.tsx`

- [ ] **Step 1: Implement `Slide09Test.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const Slide09Test: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '42vw', height: '42vw', bottom: '-10%', right: '-8%', opacity: 0.05, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>06 · Lab — 테스트</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>채웠으면 바로 테스트</h2>
      <pre className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-6 font-mono text-2xl text-[#d4ede0] text-center mb-6" style={{ animationDelay: '0.5s' }}>
        /x402-pay
      </pre>
      <div className="fade-in-stagger w-full bg-cream/70 border border-forest/20 rounded-xl px-6 py-5 font-sans text-lg text-dark/80 text-center" style={{ animationDelay: '0.9s' }}>
        Claude가 실제로 서버에 요청하고<br />
        <strong className="font-medium text-dark">결제 → 퀘스트 수신</strong> 까지 하면 성공
      </div>
    </div>
  </div>
)

export default Slide09Test
```

- [ ] **Step 2: Implement `Slide10Go.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const Slide10Go: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '60vw', height: '60vw', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.04, animationDelay: '-1s' }} />
    <div key={animKey} className="flex flex-col items-center content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-6" style={{ animationDelay: '0s' }}>07 · Marathon</p>
      <div className="fade-in-stagger font-serif text-[12vw] font-bold text-terracotta leading-none mb-2" style={{ animationDelay: '0.2s' }}>
        GO
      </div>
      <div className="fade-in-stagger font-mono text-base tracking-[0.3em] uppercase text-sage mb-8" style={{ animationDelay: '0.6s' }}>
        QUEST MARATHON
      </div>
      <pre className="fade-in-stagger bg-[#1e2d24] rounded-xl px-10 py-5 font-mono text-2xl text-[#d4ede0] text-center mb-6" style={{ animationDelay: '0.9s' }}>
        /x402-quest
      </pre>
      <div className="fade-in-stagger bg-terracotta/5 border border-terracotta/25 rounded-xl px-6 py-4 font-sans text-base text-terracotta/90 text-center" style={{ animationDelay: '1.2s' }}>
        초기 지급 <strong className="text-dark font-medium">10 TONE</strong> · 10개 퀘스트 전부 1 TONE · 10 TONE으로 딱 완주
      </div>
    </div>
  </div>
)

export default Slide10Go
```

- [ ] **Step 3: Implement `Slide11Quests.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const Slide11Quests: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '40vw', height: '40vw', bottom: '-8%', left: '-5%', opacity: 0.07, animationDelay: '-5s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>07 · Marathon — 퀘스트 구성</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>10개 퀘스트</h2>
      <table className="fade-in-stagger w-full text-sm mb-6" style={{ animationDelay: '0.5s', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['퀘스트', '가격', '유형'].map(h => (
              <th key={h} className="bg-forest/8 text-forest font-mono text-xs tracking-wider uppercase px-4 py-2.5 text-left border-b border-forest/20">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-sage/10">
            <td className="px-4 py-3 text-dark/80 font-sans">1~9</td>
            <td className="px-4 py-3 font-sans"><strong className="text-terracotta font-medium">1 TONE 각</strong></td>
            <td className="px-4 py-3 text-dark/70 font-sans">OX / 객관식 (Avalanche, Claude, AI)</td>
          </tr>
          <tr className="border-b border-sage/10">
            <td className="px-4 py-3 text-dark/80 font-sans">10</td>
            <td className="px-4 py-3 font-sans"><strong className="text-terracotta font-medium">1 TONE</strong></td>
            <td className="px-4 py-3 text-dark/70 font-sans">웹 연동 — UUID URL 방문 후 코드 수령</td>
          </tr>
        </tbody>
      </table>
      <div className="fade-in-stagger w-full bg-cream/70 border border-forest/20 rounded-xl px-6 py-4 font-sans text-base text-dark/80" style={{ animationDelay: '0.9s' }}>
        Top 3 완주자에게 <strong className="font-medium text-dark">특별 선물</strong> 있습니다
      </div>
    </div>
  </div>
)

export default Slide11Quests
```

- [ ] **Step 4: Implement `Slide12Leaderboard.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const Slide12Leaderboard: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '50vw', height: '50vw', top: '-10%', right: '-10%', opacity: 0.04, animationDelay: '-6s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>07 · Marathon — 실시간 순위</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>순위판</h2>
      <pre className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-5 font-mono text-base text-[#d4ede0] text-center mb-5" style={{ animationDelay: '0.5s' }}>
        http://[서버주소]/leaderboard
      </pre>
      <p className="fade-in-stagger font-sans font-light text-sm text-sage" style={{ animationDelay: '0.9s' }}>
        발표 화면에서 실시간으로 보여드립니다
      </p>
    </div>
  </div>
)

export default Slide12Leaderboard
```

- [ ] **Step 5: Implement `Slide13Bonus.tsx`**

```tsx
interface Props { isActive: boolean; animKey: number }

const Slide13Bonus: React.FC<Props> = ({ animKey }) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '40vw', height: '40vw', bottom: '-8%', right: '-5%', opacity: 0.04, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-3xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>08 · Bonus</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8 text-center" style={{ animationDelay: '0.2s' }}>
        내 서비스를<br /><span className="text-terracotta">x402</span>로 등록하기
      </h2>
      <div className="fade-in-stagger grid grid-cols-2 gap-5 w-full mb-6" style={{ animationDelay: '0.5s' }}>
        <div className="bg-cream/70 border border-forest/15 rounded-xl px-6 py-5">
          <p className="font-mono text-xs tracking-widest uppercase text-forest mb-3">오늘 쓴 코드 = 템플릿</p>
          <p className="font-sans text-sm text-dark/70 leading-relaxed mb-4">
            x402-server가 그대로<br />구현 레퍼런스가 됩니다
          </p>
          <pre className="bg-[#1e2d24] rounded-lg px-4 py-3 font-mono text-xs text-[#d4ede0]">
            github.com/avalanche-team1/{'\n'}x402-all-in-one
          </pre>
        </div>
        <div className="bg-cream/70 border border-forest/15 rounded-xl px-6 py-5">
          <p className="font-mono text-xs tracking-widest uppercase text-forest mb-3">agentic.market 등록</p>
          <p className="font-sans text-sm text-dark/70 leading-relaxed mb-4">
            AI 에이전트들이 탐색하는<br />마켓에 서비스 올리기
          </p>
          <pre className="bg-[#1e2d24] rounded-lg px-4 py-3 font-mono text-xs text-[#d4ede0]">
            agentic.market/register
          </pre>
        </div>
      </div>
      <div className="fade-in-stagger w-full bg-forest/6 border border-forest/20 rounded-xl px-6 py-4 font-sans text-base text-forest text-center" style={{ animationDelay: '0.9s' }}>
        AI 에이전트가 여러분의 플랫폼에 찾아와 구매해가는 구조
      </div>
    </div>
  </div>
)

export default Slide13Bonus
```

- [ ] **Step 6: Run tests**

```bash
cd lecture && npm test
```

Expected: 5 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add lecture/src/slides/Slide09Test.tsx lecture/src/slides/Slide10Go.tsx lecture/src/slides/Slide11Quests.tsx lecture/src/slides/Slide12Leaderboard.tsx lecture/src/slides/Slide13Bonus.tsx
git commit -m "feat(lecture): implement slides 09-13 (test, go, quests, leaderboard, bonus)"
```

---

## Task 7: Build Verification

- [ ] **Step 1: Start dev server and verify all 13 slides**

```bash
cd lecture && npm run dev
```

Open `http://localhost:5173`. Navigate through all 13 slides with arrow keys. Check:
- Slide 1: beige bg, large serif title, terracotta accent on "첫 결제"
- Slide 6: forest numbered badges, terracotta strong text
- Slide 7: 3-column compare grid, terracotta highlight on "HTTP 402" row
- Slide 10: massive "GO" text
- Slide 13: two-column card grid

- [ ] **Step 2: Verify animations replay on navigation**

Navigate away from slide 1, then back. Elements should fade in again.

- [ ] **Step 3: Verify custom cursor**

Move mouse — custom cursor (blurred terracotta circle) follows. Click — cursor expands.

- [ ] **Step 4: Run build**

```bash
cd lecture && npm run build
```

Expected: `dist/` created. No TypeScript errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(lecture): complete Vite+React redesign — warm beige design system"
```
