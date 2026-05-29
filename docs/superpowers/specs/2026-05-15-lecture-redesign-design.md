# Lecture 페이지 리디자인 스펙

**날짜**: 2026-05-15  
**대상**: `lecture/` 디렉토리 전체 교체  
**참조**: `~/prj/AI/AxK/idea-stage-fe` 디자인 시스템

---

## 목표

현재 `lecture/index.html` (다크 블루 + Courier New 단일 파일)을 Vite + React 프로젝트로 교체한다. 슬라이드 내용(13개)은 그대로 유지하고, 디자인 시스템만 idea-stage-fe 스타일로 전환한다.

---

## 디자인 시스템

### 색상 팔레트

| 변수 | 값 | 용도 |
|---|---|---|
| `--color-beige` | `#F5F0E8` | 배경 (전체 bg) |
| `--color-terracotta` | `#C4714A` | 주 강조색 (accent) |
| `--color-forest` | `#3D6B4F` | 보조 강조, 번호 뱃지, 코드 bg |
| `--color-sage` | `#7A9E87` | 서브텍스트, 태그, 도트 인디케이터 |
| `--color-cream` | `#FFFDF9` | 카드/패널 bg |
| `--color-dark` | `#1A1A1A` | 본문 텍스트 |

### 타이포그래피

| 폰트 | 용도 |
|---|---|
| Playfair Display (serif) | 슬라이드 헤드라인 |
| Outfit (sans-serif) | 본문, UI 요소, 리스트 |
| JetBrains Mono (monospace) | 태그 라벨, 코드, 슬라이드 번호 |

Google Fonts CDN에서 로드.

### 코드 블록 스타일

- `<pre>` 블록: forest 계열 다크 배경 (`#1e2d24`), 연한 초록 텍스트
- inline `<code>`: `rgba(61,107,79,0.12)` 배경, forest 색 텍스트

---

## 인터랙션

### 슬라이드 전환
- idea-stage-fe와 동일한 horizontal translateX 방식
- `slides-container`: `display:flex; width: N*100vw`
- 전환: `transform: translateX(-index * 100vw)` + `transition: 0.4s cubic-bezier(0.2, 0, 0, 1)`

### 네비게이션
- 키보드: `ArrowRight` / `ArrowLeft`
- 하단 dot indicator (클릭 가능)
- 우상단 슬라이드 번호 (`X / 13`)

### Ambient Shape
- 각 슬라이드에 blur 80px 반투명 원 2~3개
- `breatheShape` keyframe: 12초 주기로 scale + opacity 미세 변동
- 색상: terracotta / forest / sage 계열, opacity 0.04~0.08

### Custom Cursor
- 기본 커서 숨김 (`cursor: none`)
- `mousemove` 이벤트로 좌표 추적
- 32×32px 원형, terracotta radial-gradient, `mix-blend-mode: multiply`
- 클릭 시 48×48px + sage 색으로 전환

### Stagger Fade-in
- 슬라이드 진입 시 주요 요소 순차 등장
- `opacity: 0 → 1`, `translateY(10px → 0)`, `animation-delay`로 순서 제어
- `gentleFadeUp` keyframe 재사용

---

## 프로젝트 구조

```
lecture/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
└── src/
    ├── main.tsx
    ├── App.tsx              # 슬라이드 네비게이션, 커서, ambient 총괄
    ├── index.css            # CSS 변수, keyframes, 공통 유틸리티
    └── slides/
        ├── Slide01Title.tsx
        ├── Slide02Agenda.tsx
        ├── Slide03Skills.tsx
        ├── Slide04Install.tsx
        ├── Slide05Explore.tsx
        ├── Slide06IphoneStory.tsx
        ├── Slide07Comparison.tsx
        ├── Slide08Hints.tsx
        ├── Slide09Test.tsx
        ├── Slide10Go.tsx
        ├── Slide11Quests.tsx
        ├── Slide12Leaderboard.tsx
        └── Slide13Bonus.tsx
```

---

## App.tsx 책임

- `currentSlide` state (0~12)
- `cursorPos` state + `isClicking` state
- `mousemove` / `mousedown` / `mouseup` / `keydown` 이벤트 핸들러
- slides-container translateX 계산
- dot indicator 렌더링
- 커스텀 커서 div 렌더링

---

## index.css 공통 클래스

idea-stage-fe의 `index.css`와 동일한 클래스 구조:

- `.slide` — 100vw × 100vh, flex center
- `.slides-container` — flex row, N×100vw
- `.ambient-shape` + `breatheShape` keyframe
- `.fade-in-stagger` + `gentleFadeUp` keyframe
- `.bloom-effect` + `bloomPulse` keyframe
- `.custom-cursor` / `.custom-cursor.active`
- `.content-z-index` — z-index: 10

---

## 슬라이드별 레이아웃 유형

| 슬라이드 | 유형 | 주요 요소 |
|---|---|---|
| 01 | 타이틀 | serif 대제목, mono 태그, sans 서브 |
| 02 | 키워드 리스트 | stagger 리스트 아이템 (label + desc) |
| 03 | 하이라이트 박스 + 코드 | hl-box, pre 블록 |
| 04 | 코드 + 하이라이트 박스 | pre, hl-box |
| 05 | 구멍(hole) 리스트 | dashed border 아이템 |
| 06 | 플로우 스텝 | forest 번호 뱃지 + 텍스트 |
| 07 | 대응표 (비교 그리드) | 3컬럼 그리드 |
| 08 | 테이블 + 코드 + hl-box | hint-table, inline code |
| 09 | 빅 CTA | pre 블록, hl-box |
| 10 | 빅 넘버/텍스트 | 96px serif "GO", pre |
| 11 | 테이블 | quest 구성표 |
| 12 | 코드 + 서브텍스트 | pre (URL), 안내 텍스트 |
| 13 | 두 컬럼 카드 | two-col grid, col-box |

---

## 의존성

```json
{
  "react": "^18",
  "react-dom": "^18",
  "vite": "^5",
  "@vitejs/plugin-react": "^4",
  "tailwindcss": "^3",
  "autoprefixer": "^10",
  "postcss": "^8",
  "typescript": "^5"
}
```

AnimFlow 등 외부 라이브러리 없음.

---

## 빌드 & 서빙

```bash
cd lecture
npm install
npm run dev    # 개발
npm run build  # dist/ 생성
```

`dist/` 를 정적 파일로 직접 서빙하거나 `npm run preview`로 확인.
