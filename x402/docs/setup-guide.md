# 🏔️ x402-Escape 운영 및 설정 가이드 (v4.2.5)

이 문서는 **x402-escape** 행사를 운영하는 빌더와 참가를 원하는 유통자들을 위한 종합 가이드입니다. 

## 1. 개요
이 프로젝트는 **APIX L1**을 기반으로 한 **상품 구매형 방탈출** 게임입니다. 참가자들은 Claude Code CLI를 통해 실시간으로 경쟁하며 10개의 퀴즈를 풀고 상품을 쟁취합니다.

*   **참가자**: `npx`를 통해 소스 코드 없이 참가.
*   **빌더**: GitHub 클론 및 서버 운영/커스텀.

## 2. 필수 환경 변수 (.env)
루트 디렉토리에 `.env` 파일을 생성하고 다음 값을 설정하세요. **보상 자동 지급을 위해 관리자 개인키가 필수입니다.**

```bash
# 1. APIX L1 노드 RPC (Native L1)
RPC_URL=https://your-apix-l1-rpc

# 2. 보상 지갑 주소 및 개인키 (APIX 보유 필수)
GATEWAY_ADDRESS=0x... # 참가자가 결제할 주소
ADMIN_PRIVATE_KEY=0x... # 보상을 자동으로 쏴줄 주소의 개인키

# 3. 서버 접속 주소
API_URL=http://your-server-ip:3000
```

## 3. 서버 운영 방법

### A. Docker로 실행 (추천)
환경 설정이 완료되었다면 명령어 한 줄로 서버를 띄울 수 있습니다.
```bash
docker compose up -d --build
```
*   `/data` 볼륨이 자동 매핑되어 컨테이너 재시작 시에도 유저 진행 상태가 보존됩니다.

### B. 로컬 개발 모드
```bash
npm install
npx x402-escape init # 초기 디렉토리 및 시드 데이터 생성
npm run dev
```

## 4. 데이터 초기화 및 리셋 (Reset)
테스트 후 행사를 처음부터 다시 시작하려면 다음 명령어를 사용하세요.
```bash
# Docker 실행 중일 때
docker compose exec app node bin/x402-escape.js seed

# 로컬 환경일 때
npx x402-escape seed
```
*이 명령어는 모든 참가자 기록을 지우고 상품 재고를 `data/seed`의 원본 상태로 복구합니다.*

## 5. 참가자 안내 방법
참가자들에게는 다음 한 줄만 공유하면 됩니다.
```bash
npx x402-escape skill
```
그 후 안내에 따라 `npx x402-escape install-skill`을 실행하면 즉시 게임 준비가 끝납니다.

## 6. 시스템 특징 및 주의사항 (⚠️)
- **Native L1 실시간 검증**: 모든 x402 결제와 보상 전송은 **APIX L1**에서 직접 발생합니다. 별도의 브릿지나 메인넷 경유가 필요 없습니다.
- **데드락 방지**: 시스템은 `products` -> `players` 순서의 엄격한 락 정책을 준수하여 40위 이상의 고부하에서도 안정적입니다.
- **개인키 보안**: `ADMIN_PRIVATE_KEY`가 유출되지 않도록 서버 보안에 각별히 유의하세요.

## 7. 서버 모니터링
```
# 도커 내부의 런타임 데이터 확인
docker exec x402_escape-app-1 ls -R runtime

# 실시간 로그 확인
docker compose logs -f app
```


---
**Author**: 2026 Avalanche Team1 Korea
