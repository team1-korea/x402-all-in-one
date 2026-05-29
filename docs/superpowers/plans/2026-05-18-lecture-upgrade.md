# Lecture Page Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 실습 구간 슬라이드(04~06)를 3개로 분리·재설계하고, Slide06(아이폰 비유)을 step-through 스토리보드로 교체한다.

**Architecture:** 기존 Slide04를 재작성, Slide05를 삭제하고 Slide05Verify·Slide06OpenGuide 신설, 기존 Slide06~13을 Slide07~14로 번호 이동. App.tsx에서 TOTAL_SLIDES=14, STEP_COUNTS 배열 업데이트.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite, Vitest + @testing-library/react

---

## File Map

| Action | Path |
|--------|------|
| Rewrite | `lecture/src/slides/Slide04Install.tsx` |
| Delete | `lecture/src/slides/Slide05Explore.tsx` |
| Create | `lecture/src/slides/Slide05Verify.tsx` |
| Create | `lecture/src/slides/Slide05Verify.test.tsx` |
| Create | `lecture/src/slides/Slide06OpenGuide.tsx` |
| Create | `lecture/src/slides/Slide06OpenGuide.test.tsx` |
| Rename+Rewrite | `Slide06IphoneStory.tsx` → `Slide07IphoneStory.tsx` |
| Create | `lecture/src/slides/Slide07IphoneStory.test.tsx` |
| Rename | `Slide07Comparison.tsx` → `Slide08Comparison.tsx` |
| Rename | `Slide08Hints.tsx` → `Slide09Hints.tsx` |
| Rename | `Slide09Test.tsx` → `Slide10Test.tsx` |
| Rename | `Slide10Go.tsx` → `Slide11Go.tsx` |
| Rename | `Slide11Quests.tsx` → `Slide12Quests.tsx` |
| Rename | `Slide12Leaderboard.tsx` → `Slide13Leaderboard.tsx` |
| Rename | `Slide12Leaderboard.test.tsx` → `Slide13Leaderboard.test.tsx` |
| Rename | `Slide13Bonus.tsx` → `Slide14Bonus.tsx` |
| Modify | `lecture/src/App.tsx` |

---

## Task 1: 기존 슬라이드 파일 번호 이동 (06→07 ~ 13→14)

**Files:**
- Rename: `lecture/src/slides/Slide06IphoneStory.tsx` → `Slide07IphoneStory.tsx`
- Rename: `Slide07Comparison.tsx` → `Slide08Comparison.tsx`
- Rename: `Slide08Hints.tsx` → `Slide09Hints.tsx`
- Rename: `Slide09Test.tsx` → `Slide10Test.tsx`
- Rename: `Slide10Go.tsx` → `Slide11Go.tsx`
- Rename: `Slide11Quests.tsx` → `Slide12Quests.tsx`
- Rename: `Slide12Leaderboard.tsx` → `Slide13Leaderboard.tsx`
- Rename: `Slide12Leaderboard.test.tsx` → `Slide13Leaderboard.test.tsx`
- Rename: `Slide13Bonus.tsx` → `Slide14Bonus.tsx`

- [ ] **Step 1: 파일 이름 일괄 변경**

```bash
cd lecture/src/slides
mv Slide06IphoneStory.tsx Slide07IphoneStory.tsx
mv Slide07Comparison.tsx Slide08Comparison.tsx
mv Slide08Hints.tsx Slide09Hints.tsx
mv Slide09Test.tsx Slide10Test.tsx
mv Slide10Go.tsx Slide11Go.tsx
mv Slide11Quests.tsx Slide12Quests.tsx
mv Slide12Leaderboard.tsx Slide13Leaderboard.tsx
mv Slide12Leaderboard.test.tsx Slide13Leaderboard.test.tsx
mv Slide13Bonus.tsx Slide14Bonus.tsx
```

- [ ] **Step 2: Slide13Leaderboard.test.tsx 내부 import 수정**

파일 `lecture/src/slides/Slide13Leaderboard.test.tsx` 열어서:
```ts
// 변경 전
import Slide12Leaderboard from './Slide12Leaderboard'
// describe 이름도 'Slide12Leaderboard'

// 변경 후
import Slide13Leaderboard from './Slide13Leaderboard'
// describe 이름 'Slide13Leaderboard'
// render 호출부도 <Slide13Leaderboard animKey={0} /> 로 변경
```

- [ ] **Step 3: 기존 테스트 통과 확인**

```bash
cd lecture
npm test
```
Expected: 기존 leaderboard 테스트 4개 PASS (App.tsx 아직 미수정이라 빌드 에러 있을 수 있음 — 테스트만 확인)

- [ ] **Step 4: commit**

```bash
git add lecture/src/slides/
git commit -m "refactor(lecture): rename slides 06-13 to 07-14"
```

---

## Task 2: Slide04Install 재작성

**Files:**
- Modify: `lecture/src/slides/Slide04Install.tsx`

- [ ] **Step 1: Slide04Install.tsx 전체 교체**

```tsx
interface Props { animKey: number }

const Slide04Install = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '38vw', height: '38vw', bottom: '-8%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>03 · Setup</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>스킬 설치하기</h2>

      <div className="fade-in-stagger flex flex-col gap-4 w-full mb-6" style={{ animationDelay: '0.5s' }}>
        <div className="bg-forest/10 border border-forest/20 rounded-xl px-5 py-4">
          <p className="font-mono text-xs tracking-widest uppercase text-forest mb-3">💻 터미널 있는 분</p>
          <pre className="bg-[#1e2d24] rounded-lg px-5 py-3 font-mono text-sm text-[#d4ede0] whitespace-pre-wrap">
            {'npx team1-x402 --url='}
            <span style={{ color: '#fbbf24' }}>강사화면 URL</span>
          </pre>
        </div>

        <div className="bg-cream/70 border border-sage/20 rounded-xl px-5 py-4">
          <p className="font-mono text-xs tracking-widest uppercase text-sage mb-2">🌐 터미널 없는 분</p>
          <p className="font-sans text-sm text-dark/70 leading-relaxed">
            브라우저 →{' '}
            <code className="bg-sage/10 px-1.5 py-0.5 rounded text-forest font-mono text-xs">vscode.dev</code>
            {' '}→ Terminal → New Terminal → 동일 명령어 실행
          </p>
        </div>
      </div>

      <p className="fade-in-stagger font-sans text-sm text-sage text-center" style={{ animationDelay: '0.9s' }}>
        완료되면 → 키로 다음 화면
      </p>
    </div>
  </div>
)

export default Slide04Install
```

- [ ] **Step 2: commit**

```bash
git add lecture/src/slides/Slide04Install.tsx
git commit -m "feat(lecture): rewrite Slide04 — 설치 2-path 안내"
```

---

## Task 3: Slide05Verify 신설

**Files:**
- Create: `lecture/src/slides/Slide05Verify.tsx`
- Create: `lecture/src/slides/Slide05Verify.test.tsx`

- [ ] **Step 1: 테스트 파일 먼저 작성**

`lecture/src/slides/Slide05Verify.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Slide05Verify from './Slide05Verify'

describe('Slide05Verify', () => {
  it('제목을 렌더링한다', () => {
    render(<Slide05Verify animKey={0} />)
    expect(screen.getByText('제대로 설치됐나요?')).toBeInTheDocument()
  })

  it('세 가지 스킬 배지를 렌더링한다', () => {
    render(<Slide05Verify animKey={0} />)
    expect(screen.getByText('x402-pay')).toBeInTheDocument()
    expect(screen.getByText('x402-discover')).toBeInTheDocument()
    expect(screen.getByText('x402-quest')).toBeInTheDocument()
  })

  it('파일 경로 트리를 렌더링한다', () => {
    render(<Slide05Verify animKey={0} />)
    expect(screen.getByText(/team1-x402/)).toBeInTheDocument()
    expect(screen.getByText(/x402-pay\/SKILL\.md/)).toBeInTheDocument()
  })

  it('트러블슈팅 섹션을 렌더링한다', () => {
    render(<Slide05Verify animKey={0} />)
    expect(screen.getByText(/목록에 없다/)).toBeInTheDocument()
    expect(screen.getByText(/그래도 안 됨/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd lecture && npm test -- Slide05Verify
```
Expected: FAIL — `Cannot find module './Slide05Verify'`

- [ ] **Step 3: Slide05Verify.tsx 구현**

`lecture/src/slides/Slide05Verify.tsx`:
```tsx
interface Props { animKey: number }

const troubleItems = [
  { q: '목록에 없다', a: 'Claude Code 재시작 → / 다시 입력' },
  { q: '명령어 오류', a: 'URL에 https:// 포함됐는지 확인' },
  { q: '그래도 안 됨', a: '손 들기 🙋 스태프가 도와드립니다' },
]

const Slide05Verify = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '42vw', height: '42vw', top: '-8%', right: '-5%', opacity: 0.05, animationDelay: '-3s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>04 · Verify</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-6" style={{ animationDelay: '0.2s' }}>제대로 설치됐나요?</h2>

      {/* Check 1: Claude Code 목록 */}
      <div className="fade-in-stagger w-full bg-forest/10 border border-forest/20 rounded-xl px-5 py-4 mb-4" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-start gap-3">
          <span className="font-mono text-sm flex-shrink-0 mt-0.5">1️⃣</span>
          <div>
            <p className="font-sans text-base text-dark mb-2">
              Claude Code에서{' '}
              <code className="bg-forest/10 px-1.5 py-0.5 rounded text-forest font-mono text-sm">/</code>
              {' '}입력 후 목록 확인
            </p>
            <div className="flex gap-2 flex-wrap">
              {['x402-pay', 'x402-discover', 'x402-quest'].map((s) => (
                <span key={s} className="bg-forest/15 border border-forest/30 rounded px-2 py-0.5 font-mono text-xs text-forest">
                  {s}
                </span>
              ))}
            </div>
            <p className="font-sans text-xs text-sage mt-2">세 개 모두 보이면 완료</p>
          </div>
        </div>
      </div>

      {/* Check 2: 파일 경로 */}
      <div className="fade-in-stagger w-full bg-cream/70 border border-sage/20 rounded-xl px-5 py-4 mb-4" style={{ animationDelay: '0.7s' }}>
        <div className="flex items-start gap-3">
          <span className="font-mono text-sm flex-shrink-0 mt-0.5">2️⃣</span>
          <div className="w-full">
            <p className="font-sans text-base text-dark mb-2">파일 위치</p>
            <pre className="bg-[#1e2d24] rounded-lg px-4 py-3 font-mono text-xs text-[#d4ede0] leading-relaxed">
              <span style={{ color: '#7eca9c' }}>{'~/.claude/plugins/'}</span>{'\n'}
              <span style={{ color: '#5a8068' }}>{'└─ '}</span>
              <span style={{ color: '#7eca9c' }}>{'team1-x402/'}</span>{'\n'}
              <span style={{ color: '#5a8068' }}>{'   ├─ '}</span>
              <span style={{ color: '#fbbf24' }}>{'x402-pay/SKILL.md'}</span>{'\n'}
              <span style={{ color: '#5a8068' }}>{'   ├─ '}</span>{'x402-discover/SKILL.md'}{'\n'}
              <span style={{ color: '#5a8068' }}>{'   └─ '}</span>{'x402-quest/SKILL.md'}
            </pre>
          </div>
        </div>
      </div>

      {/* Troubleshoot */}
      <div className="fade-in-stagger w-full bg-terracotta/5 border border-terracotta/20 rounded-xl px-5 py-4" style={{ animationDelay: '0.9s' }}>
        <p className="font-mono text-xs tracking-widest uppercase text-terracotta mb-3">⚠ 스킬이 안 보이면?</p>
        <div className="flex flex-col gap-2">
          {troubleItems.map(({ q, a }) => (
            <div key={q} className="flex gap-3 text-sm">
              <span className="font-mono text-terracotta/80 font-medium min-w-[90px] flex-shrink-0">{q}</span>
              <span className="font-sans text-dark/70">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default Slide05Verify
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd lecture && npm test -- Slide05Verify
```
Expected: 4 tests PASS

- [ ] **Step 5: commit**

```bash
git add lecture/src/slides/Slide05Verify.tsx lecture/src/slides/Slide05Verify.test.tsx
git commit -m "feat(lecture): add Slide05Verify — 설치 확인 + 경로 안내"
```

---

## Task 4: Slide06OpenGuide 신설

**Files:**
- Create: `lecture/src/slides/Slide06OpenGuide.tsx`
- Create: `lecture/src/slides/Slide06OpenGuide.test.tsx`

- [ ] **Step 1: 테스트 파일 먼저 작성**

`lecture/src/slides/Slide06OpenGuide.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Slide06OpenGuide from './Slide06OpenGuide'

describe('Slide06OpenGuide', () => {
  it('제목을 렌더링한다', () => {
    render(<Slide06OpenGuide animKey={0} />)
    expect(screen.getByText('SKILL.md 열기')).toBeInTheDocument()
  })

  it('4가지 열기 방법을 모두 렌더링한다', () => {
    render(<Slide06OpenGuide animKey={0} />)
    expect(screen.getByText('VSCode')).toBeInTheDocument()
    expect(screen.getByText('메모장 / TextEdit')).toBeInTheDocument()
    expect(screen.getByText('터미널')).toBeInTheDocument()
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd lecture && npm test -- Slide06OpenGuide
```
Expected: FAIL — `Cannot find module './Slide06OpenGuide'`

- [ ] **Step 3: Slide06OpenGuide.tsx 구현**

`lecture/src/slides/Slide06OpenGuide.tsx`:
```tsx
interface Props { animKey: number }

const methods = [
  {
    icon: '🖥️',
    label: 'VSCode',
    desc: '탐색기 → ~/.claude/plugins/team1-x402 폴더 열기',
  },
  {
    icon: '📝',
    label: '메모장 / TextEdit',
    desc: '파일 탐색기에서 SKILL.md 더블클릭 → 텍스트 편집기로 열기',
  },
  {
    icon: '⌨️',
    label: '터미널',
    desc: 'cat ~/.claude/plugins/team1-x402/x402-pay/SKILL.md',
  },
  {
    icon: '🤖',
    label: 'Claude Code',
    desc: '/x402-pay 실행 전 Claude에게 스킬 파일 읽게 하면 미리 확인 가능',
  },
]

const Slide06OpenGuide = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '40vw', height: '40vw', bottom: '-8%', left: '-5%', opacity: 0.06, animationDelay: '-5s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>05 · Explore</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-8" style={{ animationDelay: '0.2s' }}>SKILL.md 열기</h2>
      <div className="fade-in-stagger flex flex-col gap-3 w-full" style={{ animationDelay: '0.5s' }}>
        {methods.map(({ icon, label, desc }) => (
          <div key={label} className="flex items-start gap-4 bg-cream/70 border border-sage/15 rounded-xl px-5 py-4">
            <span className="text-2xl flex-shrink-0">{icon}</span>
            <div>
              <p className="font-sans text-base text-dark font-medium mb-1">{label}</p>
              <p className="font-sans text-sm text-dark/60 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Slide06OpenGuide
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd lecture && npm test -- Slide06OpenGuide
```
Expected: 2 tests PASS

- [ ] **Step 5: commit**

```bash
git add lecture/src/slides/Slide06OpenGuide.tsx lecture/src/slides/Slide06OpenGuide.test.tsx
git commit -m "feat(lecture): add Slide06OpenGuide — SKILL.md 열기 가이드"
```

---

## Task 5: Slide07IphoneStory 스토리보드 재작성

**Files:**
- Rewrite: `lecture/src/slides/Slide07IphoneStory.tsx` (Task 1에서 rename됨)
- Create: `lecture/src/slides/Slide07IphoneStory.test.tsx`

- [ ] **Step 1: 테스트 파일 먼저 작성**

`lecture/src/slides/Slide07IphoneStory.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Slide07IphoneStory from './Slide07IphoneStory'

describe('Slide07IphoneStory', () => {
  it('제목을 렌더링한다', () => {
    render(<Slide07IphoneStory animKey={0} />)
    expect(screen.getByText('아이폰 사러 애플스토어 가기')).toBeInTheDocument()
  })

  it('step=0이면 모든 프레임이 흐릿하게 표시된다', () => {
    const { container } = render(<Slide07IphoneStory animKey={0} step={0} />)
    const frames = container.querySelectorAll('[data-testid="story-frame"]')
    frames.forEach((frame) => {
      expect(frame).toHaveStyle({ opacity: '0.12' })
    })
  })

  it('step=3이면 첫 3개 프레임만 완전히 표시된다', () => {
    const { container } = render(<Slide07IphoneStory animKey={0} step={3} />)
    const frames = container.querySelectorAll('[data-testid="story-frame"]')
    expect(frames[0]).toHaveStyle({ opacity: '1' })
    expect(frames[1]).toHaveStyle({ opacity: '1' })
    expect(frames[2]).toHaveStyle({ opacity: '1' })
    expect(frames[3]).toHaveStyle({ opacity: '0.12' })
  })

  it('7개 프레임 캡션을 모두 렌더링한다', () => {
    render(<Slide07IphoneStory animKey={0} step={7} />)
    expect(screen.getByText('아 아이폰 사고 싶다')).toBeInTheDocument()
    expect(screen.getByText('아이폰 수령!')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd lecture && npm test -- Slide07IphoneStory
```
Expected: FAIL (파일 내용이 아직 구버전)

- [ ] **Step 3: Slide07IphoneStory.tsx 전체 교체**

`lecture/src/slides/Slide07IphoneStory.tsx`:
```tsx
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
      <div style={{ padding: '8px 10px', borderTop: '1px solid #e8e2d8' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '9px', color: '#C4714A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
          {frame.num} {frame.sub}
        </p>
        <p style={{ fontFamily: 'sans-serif', fontSize: '11px', color: '#1A1A1A', lineHeight: 1.3 }}>
          {frame.caption}
        </p>
      </div>
    </div>
  )
}

const Slide07IphoneStory = ({ animKey, step = 0 }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '45vw', height: '45vw', bottom: '-10%', right: '-10%', opacity: 0.07, animationDelay: '-4s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-5xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-3" style={{ animationDelay: '0s' }}>
        06 · Theory — 아이폰 비유
      </p>
      <h2 className="fade-in-stagger font-serif text-4xl text-dark mb-6" style={{ animationDelay: '0.2s' }}>
        아이폰 사러 애플스토어 가기
      </h2>

      {/* Row 1: 프레임 4개 */}
      <div className="fade-in-stagger w-full grid grid-cols-4 gap-3 mb-3" style={{ animationDelay: '0.4s' }}>
        {frames.slice(0, 4).map((f, i) => (
          <StoryFrame key={f.num} frame={f} revealed={step > i} />
        ))}
      </div>

      {/* Row 2: 프레임 3개 (왼쪽 정렬) */}
      <div className="fade-in-stagger w-full grid grid-cols-4 gap-3" style={{ animationDelay: '0.4s' }}>
        {frames.slice(4).map((f, i) => (
          <StoryFrame key={f.num} frame={f} revealed={step > i + 4} />
        ))}
        <div />
      </div>
    </div>
  </div>
)

export default Slide07IphoneStory
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd lecture && npm test -- Slide07IphoneStory
```
Expected: 4 tests PASS

- [ ] **Step 5: commit**

```bash
git add lecture/src/slides/Slide07IphoneStory.tsx lecture/src/slides/Slide07IphoneStory.test.tsx
git commit -m "feat(lecture): rewrite Slide07 — 아이폰 스토리보드 step-through"
```

---

## Task 6: App.tsx 업데이트

**Files:**
- Modify: `lecture/src/App.tsx`

- [ ] **Step 1: App.tsx 전체 교체**

`lecture/src/App.tsx`:
```tsx
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
const STEP_COUNTS = [0, 3, 0, 0, 0, 0, 7, 0, 3, 0, 0, 0, 0, 0]

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
        <Slide06OpenGuide animKey={animKeys[5]} />
        <Slide07IphoneStory animKey={animKeys[6]} step={currentSteps[6]} />
        <Slide08Comparison animKey={animKeys[7]} />
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
```

- [ ] **Step 2: TypeScript 빌드 확인**

```bash
cd lecture && npx tsc --noEmit
```
Expected: 에러 없음

- [ ] **Step 3: 전체 테스트 통과 확인**

```bash
cd lecture && npm test
```
Expected: 전체 테스트 PASS

- [ ] **Step 4: commit**

```bash
git add lecture/src/App.tsx
git commit -m "feat(lecture): update App.tsx — 14 slides, STEP_COUNTS[6]=7"
```

---

## Task 7: Slide05Explore 삭제 + 빌드 검증

**Files:**
- Delete: `lecture/src/slides/Slide05Explore.tsx`

- [ ] **Step 1: 파일 삭제**

```bash
rm lecture/src/slides/Slide05Explore.tsx
```

- [ ] **Step 2: vite 개발 서버 기동 및 슬라이드 동작 확인**

```bash
cd lecture && npm run dev
```

브라우저에서 확인:
- 슬라이드 총 14개 (하단 dot 14개)
- Slide04: 설치 화면 (경로 2개)
- Slide05: 확인 화면 (스킬 배지 3개 + 경로 트리)
- Slide06: SKILL.md 열기 가이드 (4가지 방법)
- Slide07: 아이폰 스토리보드 (→ 키 7번으로 프레임 순서대로 등장)
- Slide09 (구 Slide08): 힌트 step-through 정상 작동

- [ ] **Step 3: 프로덕션 빌드 확인**

```bash
cd lecture && npm run build
```
Expected: 에러 없이 빌드 완료

- [ ] **Step 4: 최종 commit**

```bash
git add -A
git commit -m "chore(lecture): remove Slide05Explore — replaced by Verify + OpenGuide"
```

---

## 이미지 에셋 (별도 작업 — 이 플랜 범위 밖)

Slide07 스토리보드 이미지 7개를 AI로 생성해서 `lecture/public/` 에 배치.
**생성 도구:** 나노바나나 (Google Gemini 계열) — 자연어 문장 형식

---

### 공통 스타일 지침 (모든 프롬프트에 적용)

- 스타일: 손으로 그린 연필 스케치, 미니멀 라인아트, 영화 스토리보드 패널 느낌
- 배경: 크림색 또는 흰색, 깔끔하게
- 선: 얇고 정교한 검정 잉크 라인
- 컬러 포인트: 장면의 핵심 요소 하나에만 테라코타(주황-갈색 계열) 색상 강조
- 비율: 가로형 4:3 (슬라이드 프레임 크기에 맞춤)
- 금지: 텍스트, 말풍선, 워터마크, 사실적인 사진 질감

---

### story-01-desire.png

```
A young person sitting on a couch, holding their old cracked phone and staring longingly at a vivid poster on the wall showing a sleek new smartphone. Their expression shows desire and longing. Hand-drawn pencil sketch style, minimal line art, cream background, thin black ink lines. The glowing smartphone poster has a warm terracotta orange tint as the only color accent. Cinematic storyboard panel, 4:3 ratio, no text, no speech bubbles.
```

---

### story-02-explore.png

```
A young person holding their phone and looking at a map app showing nearby store locations, with a location pin marking the closest Apple Store. Their finger points at the nearest pin on the map. Hand-drawn pencil sketch style, minimal line art, cream background, thin black ink lines. The nearest location pin on the map glows in terracotta orange as the only color accent. Cinematic storyboard panel, 4:3 ratio, no text, no speech bubbles.
```

---

### story-03-request.png

```
A young customer standing at a clean retail counter, pointing at a display phone to a store employee behind the counter. The employee listens attentively. The store interior is minimal and bright. Hand-drawn pencil sketch style, minimal line art, cream background, thin black ink lines. The display phone being pointed at has a terracotta orange highlight as the only color accent. Cinematic storyboard panel, 4:3 ratio, no text, no speech bubbles.
```

---

### story-04-payment.png

```
A store employee turns a payment terminal screen toward the customer, showing the total amount. The customer looks at the screen with a slightly surprised expression, reaching for their wallet. Hand-drawn pencil sketch style, minimal line art, cream background, thin black ink lines. The payment terminal screen glows in terracotta orange as the only color accent. Cinematic storyboard panel, 4:3 ratio, no text, no speech bubbles.
```

---

### story-05-sign.png

```
Close-up of a hand holding a credit card and swiping it across a payment terminal. The focus is on the hand and card in motion, no insertion slot visible. Hand-drawn pencil sketch style, minimal line art, cream background, thin black ink lines. The card held in the hand is highlighted in terracotta orange as the only color accent. Cinematic storyboard panel, 4:3 ratio, no text, no speech bubbles.
```

---

### story-06-approve.png

```
A payment terminal screen displays a large checkmark approval symbol. The store employee gives a small nod or thumbs-up gesture in the background. The scene feels calm and resolved. Hand-drawn pencil sketch style, minimal line art, cream background, thin black ink lines. The checkmark on the screen is drawn in terracotta orange as the only color accent. Cinematic storyboard panel, 4:3 ratio, no text, no speech bubbles.
```

---

### story-07-receive.png

```
A young person holds up a clean white product box with both hands, eyes wide with delight, a big smile on their face. The box is the focal point, held slightly above eye level in a triumphant pose. Hand-drawn pencil sketch style, minimal line art, cream background, thin black ink lines. The product box has a terracotta orange logo or ribbon as the only color accent. Cinematic storyboard panel, 4:3 ratio, no text, no speech bubbles.
```

---

### 배치 방법

생성 후 `lecture/public/` 에 저장:
- `story-01-desire.png`
- `story-02-explore.png`
- `story-03-request.png`
- `story-04-payment.png`
- `story-05-sign.png`
- `story-06-approve.png`
- `story-07-receive.png`

이미지 배치 후 별도 커밋 권장: `git commit -m "assets(lecture): add storyboard images for Slide07"`
