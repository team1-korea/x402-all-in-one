# 📐 아키텍처: x402 순환 경제 모델

본 프레임워크는 Avalanche L1 기반의 X402 프로토콜을 활용하여 자생적인 경제 구조를 형성하도록 설계되었습니다.

---

## 1. 비즈니스 로직 흐름
1. **마중물(Seed Faucet)**: 신규 참가자에게 1 APIX 지급 (가스비 + 첫 결제금).
2. **소비(Spend - X402)**: 참가자가 정찰가 $Y$ APIX를 지불하여 퀴즈 컨텐츠를 획득.
3. **획득(Earn - Reward)**: 퀴즈 정답 통과 시 $X$ APIX 보상을 실시간 수령.
4. **순환 구조**: $X \geq Y + Gas$ 설정을 통해, 정답만 맞히면 외부 자산 추가 없이 10단계까지 완주 가능.

## 2. 계층형 아키텍처 (Layered Design)
- **Core Layer**: Avalanche SDK 및 X402 SDK (온체인 트랜잭션 및 보상 처리 엔진).
- **Server Layer**: Next.js API Routes (상태 오케스트레이션 및 비즈니스 검증).
- **CLI Layer**: 운영자 도구 및 참가자 온보딩 인터페이스.
- **Runtime Layer**: 이벤트 진행 중에만 생존하는 휘발성 JSON 상태 저장소.

## 3. 설계 철학 (Antigravity OS)
- **Surgical Engineering**: 코드 변화는 최소화하되 모듈성은 극대화하여 구조적 아름다움을 유지합니다.
- **Ambiguity Guard**: 결제 실패 및 멱등성 위반 시 명확한 에러 상태를 제공하여 모호한 예외 처리를 차단합니다.
- **Fortress Security**: 개인키와 민감 로직을 Core 레이어에 격리하여 보안 침해 사고를 방지합니다.
