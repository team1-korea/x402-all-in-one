# Lecture Page Upgrade — Design Spec

**Date:** 2026-05-18  
**Scope:** 강의 슬라이드 콘텐츠 고도화 (실습 구간 중심)

---

## 1. 변경 개요

| 항목 | Before | After |
|------|--------|-------|
| 총 슬라이드 수 | 13 | 14 |
| Slide04 (설치) | npx 명령어 한 줄 | → 설치 전용 화면으로 분리 |
| Slide05 (탐색) | TODO 빈칸 나열 | → 삭제, 새 2개 슬라이드로 대체 |
| Slide06 (아이폰 비유) | 7단계 텍스트 리스트, step-through 없음 | → 스토리보드 이미지 + step-through reveal |
| Slide07~13 | 변경 없음 | 번호만 한 칸씩 밀림 (Slide08~14) |

---

## 2. 새 슬라이드 구조 (Slide 04~07)

### Slide 04 · 설치 `03 · Setup`

**목적:** npx 명령어로 스킬을 설치하는 것 하나만 집중

**콘텐츠:**
- 제목: `스킬 설치하기`
- 경로 분기 2개:
  - **터미널 있는 분**: `npx team1-x402 --url=[강사화면 URL]`
  - **터미널 없는 분**: 브라우저 → vscode.dev → Terminal → New Terminal → 동일 명령어
- 하단 안내: "완료되면 → 키로 다음 화면"
- URL은 placeholder(`강사화면 URL`)로 두고, 강의 당일 강사가 화면에 띄워줌

**인터랙션:** step-through 없음 (단순 표시)

---

### Slide 05 · 확인 `04 · Verify`

**목적:** 설치가 제대로 됐는지 확인 + 파일이 어디에 깔렸는지 경로 안내

**콘텐츠:**
- 제목: `제대로 설치됐나요?`
- 체크 1: Claude Code에서 `/` 입력 → `x402-pay`, `x402-discover`, `x402-quest` 세 개 보이면 OK
- 체크 2: 파일 경로 트리
  ```
  ~/.claude/plugins/
  └─ team1-x402/
     ├─ x402-pay/SKILL.md
     ├─ x402-discover/SKILL.md
     └─ x402-quest/SKILL.md
  ```
- 트러블슈팅 섹션:
  - 목록에 없다 → Claude Code 재시작 후 `/` 다시 입력
  - 명령어 오류 → URL에 `https://` 포함됐는지 확인
  - 그래도 안 됨 → 손 들기 🙋

**인터랙션:** step-through 없음

---

### Slide 06 · 열기 가이드 `05 · Explore`

**목적:** SKILL.md 파일을 여는 방법 안내 (에디터 종류별)

**콘텐츠:**
- 제목: `SKILL.md 열기`
- 4가지 방법 리스트:
  1. **VSCode**: 탐색기 → `~/.claude/plugins/team1-x402` 폴더 열기
  2. **메모장 / TextEdit**: 파일 탐색기에서 SKILL.md 더블클릭 → 텍스트 편집기로 열기
  3. **터미널**: `cat ~/.claude/plugins/team1-x402/x402-pay/SKILL.md`
  4. **Claude Code에서 바로**: `/x402-pay` 실행 전 스킬 내용 미리 확인 가능

**인터랙션:** step-through 없음

---

### Slide 07 · 아이폰 스토리보드 `05 · Theory — 아이폰 비유` (구 Slide06)

**목적:** x402 결제 흐름을 아이폰 구매 스토리로 직관적으로 설명

**레이아웃:** 4+3 그리드 (2줄)
- 1줄: 프레임 4개 (①②③④)
- 2줄: 프레임 3개 (⑤⑥⑦), 왼쪽 정렬

**각 프레임 구성:** 이미지 + 번호 + 짧은 캡션

**프레임 내용:**

| # | 캡션 | x402 대응 |
|---|------|-----------|
| ① 욕구 발생 | 아 아이폰 사고 싶다 | 필요한 서비스 생김 |
| ② 탐색 | 애플스토어 목록 확인 | GET 요청 |
| ③ 요청 | "아이폰 13 주세요" | 원하는 것 요청 |
| ④ 결제 요구 | "결제해주세요" | HTTP 402 응답 |
| ⑤ 서명 | 카드 꽂기 | EIP-3009 서명 생성 |
| ⑥ 승인 | 카드사 처리 | facilitator 검증 + 온체인 |
| ⑦ 수령 | 아이폰 수령! | 서비스 응답 |

**이미지 스타일:** AI 생성, Sketch / Line Art (손으로 그린 스케치 느낌)
- 배경: 흰색 또는 크림색
- 선: 흑연 펜 느낌, 얇은 라인
- 컬러 포인트: terracotta (#C4714A) 강조
- 각 이미지 크기: 정사각형 또는 4:3 비율

**이미지 프롬프트 (AI 생성용):**
> "storyboard sketch illustration, hand-drawn pencil style, minimal line art, [scene description], white background, thin black lines, small terracotta color accent, simple cinematic frame composition, no text"

**인터랙션:** step-through reveal
- `STEP_COUNTS[6] = 7` (→ 키 7번으로 프레임 하나씩 순서대로 등장)
- 등장 방식: `opacity 0 → 1`, `blur 해제`, 부드러운 transition (0.4s ease)
- 아직 등장 안 한 프레임: `opacity: 0.15`, `blur(2px)` 또는 완전히 숨김
- 현재 등장한 프레임: 테두리 terracotta 강조

---

## 3. 유지되는 슬라이드 (번호 변경)

| 구 번호 | 새 번호 | 제목 | 변경사항 |
|---------|---------|------|---------|
| Slide07 | Slide08 | x402 대응표 | 추후 수정 예정, 지금은 유지 |
| Slide08 | Slide09 | 구멍 채우기 | 유지 |
| Slide09 | Slide10 | 첫 결제 테스트 | 유지 |
| Slide10 | Slide11 | GO | 유지 |
| Slide11 | Slide12 | 퀘스트 목록 | 유지 |
| Slide12 | Slide13 | 리더보드 | 유지 |
| Slide13 | Slide14 | 보너스 | 유지 |

---

## 4. App.tsx 변경사항

```ts
const TOTAL_SLIDES = 14  // 13 → 14

const STEP_COUNTS = [
  0,  // 01 Title
  3,  // 02 Agenda
  0,  // 03 Skills
  0,  // 04 설치 (new)
  0,  // 05 확인 (new)
  0,  // 06 열기 가이드 (new)
  7,  // 07 아이폰 스토리보드 (구 06, 0→7)
  0,  // 08 대응표 (구 07)
  3,  // 09 Hints (구 08)
  0,  // 10 Test (구 09)
  0,  // 11 Go (구 10)
  0,  // 12 Quests (구 11)
  0,  // 13 Leaderboard (구 12)
  0,  // 14 Bonus (구 13)
]
```

---

## 5. 이미지 에셋 (별도 작업)

Slide07 스토리보드용 이미지 7개 AI 생성 필요:
- `public/story-01-desire.png`
- `public/story-02-explore.png`
- `public/story-03-request.png`
- `public/story-04-payment-demand.png`
- `public/story-05-sign.png`
- `public/story-06-approve.png`
- `public/story-07-receive.png`

이미지 생성 후 `public/` 에 배치, 슬라이드에서 참조.

---

## 6. 범위 외 (이번 작업 제외)

- Slide08 (x402 대응표) step-through 추가 — 추후
- Slide10 (테스트) 성공/실패 케이스 안내 — 추후
