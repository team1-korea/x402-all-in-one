# 🏔️ x402-Escape: Avalanche L1 Native Framework

**x402-Escape**는 Avalanche APIX L1 네트워크를 기반으로 한 상품 구매형 방탈출 이벤트 엔진입니다.

참가자는 **Claude Code CLI**를 통해 10개의 퀴즈를 풀고 실시간 재고를 선점하여 실제 보상을 획득하게 됩니다.

---

## 🎮 게임 참여 가이드 (How to Play)

참가자는 Claude Code CLI를 통해 아주 간단하게 이벤트에 참여할 수 있습니다.

### 1단계: 에이전트 스킬 주입
- 자신의 프로젝트 폴더에서 아래 명령어를 실행하고, 안내에 따라 **행사 API 주소**를 입력합니다.
```bash
# 실행 후 터미널의 안내에 따라 주소 입력
npx team1-korea/x402 install-skill

저장소 공개 전 테스트 (비공개 상태):
운영진은 저장소를 클론한 후, 프로젝트 루트에서 node cli/x402-escape.js install-skill 명령어로 로컬 에이전트 스킬을 설치하여 검증합니다.

```

### 2단계: 방탈출 시작
- Claude Code 터미널에서 `/x402-escape`를 입력하거나 "방탈출 시작해줘"라고 말하세요.
- AI가 설치된 스킬 명세를 바탕으로 현재 실시간 재고가 남아있는 상품 목록을 화려하게 보여줄 것입니다.

### 3단계: 상품 선택 및 퀴즈 도전
- 목표 상품을 선택하면 AI가 자동으로 지갑을 준비하고 **Avalanche APIX L1** 상에서 10단계의 퀴즈 여정을 시작합니다.
- 각 단계마다 결제 토큰 생성 및 보상 수령이 AI 에이전트에 의해 자동으로 관리됩니다.

### 4단계: 최종 당첨 및 보상 확인
- 10번째 퀴즈를 누구보다 먼저 통과하여 상품 획득을 확정하세요!

---

## ✨ 핵심 기능 (Key Features)

- **Smart Stock Guard**: 플레이 중 실시간 재고를 체크하여 품절 시 즉시 안내 (Fail-Fast UX 최적화).
- **Multi-Path Engine**: 10개의 상품별로 독립된 10개의 퀴즈 경로 및 로직 자동화.
- **X402 Standard Gate**: 온체인 결제 증명(`txHash`)을 통한 정교한 컨텐츠 게이팅 및 보상 지급.
- **Atomic File-Locking**: `withFileLock` 엔진 기반의 원자적 상태 관리로 동시 접속 시 데이터 무결성 보장.

## 🏗️ Layered Architecture

본 프로젝트는 유지보수성과 확장성을 위해 4개의 핵심 레이어로 구성되어 있습니다.

| 레이어 | 경로 | 역할 |
| :--- | :--- | :--- |
| **Core** | `/src/core` | Avalanche & X402 SDK 연동, 보상 지급, 파일 락킹 엔진 |
| **Server** | `/src/app/api` | Next.js 14 기반의 비즈니스 로직 및 API 엔드포인트 |
| **CLI** | `/cli` | 운영용 도구 (초기화, 리셋, 상태 모니터링, 스킬 설치) |
| **Runtime** | `/runtime` | 이벤트 진행 중 발생하는 실시간 상태 데이터 및 액션 로그 |

## 📄 Documentation Hub

상황에 맞는 문서를 확인하여 신속하게 프로젝트에 기여할 수 있습니다.

- **[Architecture Overview](docs/architecture.md)**: 전체 시스템 흐름 및 순환 경제 모델($X \geq Y + Gas$) 이해
- **[Technical Specification](docs/specs/technical-core.md)**: 데이터 스키마, 결제 멱등성 정책, 락킹 계층 구조 명세
- **[Operator Manual](docs/ops/event-manual.md)**: CLI 사용법, 환경 변수 설정, 비상시 시스템 리셋 가이드
- **[API Specification](docs/api-specification.md)**: 엔드포인트별 요청/응답 시그니처 및 상태 코드

## 🚀 Quick Start (Production Mode)

본 프레임워크는 macOS 권한 문제를 우회하고 최상의 성능을 내기 위해 **Docker 환경**에서의 실행을 권장합니다.

```bash
# 1. 운영 서버 기동 (Build & Run)
# 4000번 포트로 즉시 서비스가 시작되며, 내부적으로 init/seed가 자동 수행됩니다.
docker-compose up -d --build

# 2. 실시간 운영 로그 모니터링
docker-compose logs -f app

# 3. 런타임 데이터 상태 확인
docker exec x402_escape-app-1 ls -R runtime
```

### 🛠️ Local Development (Internal)
로컬에서 코드를 직접 수정하거나 디버깅할 경우에만 사용하세요.
```bash
npm install
npm run dev
```

**Powered by 2026 Avalanche Team1 Korea** | **Ver**: `4.3.0` | **Status**: `PROD_READY`
