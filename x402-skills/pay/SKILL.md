---
name: x402-pay
description: x402 결제 흐름을 직접 구현합니다. EIP-3009 서명을 생성하고 X-PAYMENT 헤더로 유료 API를 호출합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 결제 흐름

USDC(EIP-3009)를 사용해 유료 퀘스트 API를 호출합니다.
아래 흐름에서 `[TODO]` 부분은 **여러분이 직접 채운 내용**을 그대로 따릅니다.

## ⛔ TODO 검사 — 반드시 먼저 확인

이 스킬을 실행하기 전에 **이 파일에 `[TODO` 문자열이 남아있는지** 확인합니다.

```bash
grep -n "\[TODO" ~/.claude/skills/x402-pay/SKILL.md
```

`[TODO`가 1개라도 남아있으면 **즉시 중단**하고 사용자에게 알립니다:

> "x402-pay 스킬에 채워지지 않은 TODO가 있습니다. 결제를 진행하기 전에 아래 항목을 직접 채워주세요."
> - 남아있는 TODO 목록을 줄 번호와 함께 보여줍니다.
> - 파일 경로: `~/.claude/skills/x402-pay/SKILL.md`

TODO가 모두 채워진 경우에만 아래 흐름을 진행합니다.

## 네트워크 / 지갑 정보

| 항목 | 값 |
|------|----|
| Chain ID | 402 |
| RPC URL | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | [TODO: 누가 결제를 검증해?] |

지갑 정보는 `.x402-wallet.json`에서 읽습니다 (`privateKey`, `walletAddress`).

---

## 1단계: 결제 요건 확인 (402 수신)

유료 엔드포인트를 결제 없이 호출하면 서버가 반환하는 것:

```
[TODO: 서버가 몇 번 응답을 돌려줘?]
```

응답 구조:

```json
{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:402",
    "asset": "0x65e1ec07cdc00f18e11dd0370c6158029f61721e",
    "amount": "10000000",
    "payTo": "0x7486fE46d82541ac4ae3b09b9a7061b8123A61Ba",
    "maxTimeoutSeconds": 60,
    "resource": "<요청한 URL>",
    "extra": { "assetTransferMethod": "eip3009", "name": "USD Coin", "version": "2" }
  }],
  "error": "결제가 필요합니다",
  "difficulty": "easy"
}
```

`accepts[0]`의 값을 그대로 2단계에서 사용합니다.

---

## 2단계: EIP-3009 서명 생성

viem으로 EIP-712 서명을 만듭니다.

```ts
const authorization = {
  from: walletAddress,
  to: [TODO: 받는 지갑 주소는 어디서 가져와?],
  value: BigInt(amount),        // accepts[0].amount
  validAfter: 0n,
  validBefore: BigInt(Math.floor(Date.now() / 1000)) + BigInt(maxTimeoutSeconds),
  nonce: crypto.getRandomValues(new Uint8Array(32)),
};
```

EIP-712 도메인 (`extra.name`, `extra.version` 사용):

```ts
const domain = {
  name: "USD Coin",    // extra.name
  version: "2",        // extra.version
  chainId: 402,
  verifyingContract: asset,   // accepts[0].asset
};
```

서명:

```ts
const signature = await walletClient.signTypedData({
  domain,
  types: {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  },
  primaryType: "TransferWithAuthorization",
  message: authorization,
});
```

---

## 3단계: X-PAYMENT 헤더 생성

페이로드를 조립하고:

```ts
const payload = {
  x402Version: 2,
  accepted: accepts[0],
  payload: {
    signature,
    authorization,
  },
};
```

JSON.stringify 후 base64(btoa)로 변환해 헤더에 담습니다.

---

## 4단계: 결제 헤더 포함 재요청

같은 URL에 결제 서명을 실은 헤더를 붙여 재요청합니다:

```
[TODO: 재요청할 때 추가하는 헤더 이름은?]: <base64 인코딩된 페이로드>
```

성공 시 서버 응답:

```json
{
  "id": "quest-2",
  "name": "퀘스트 2 — Claude 스킬",
  "questType": "theory-ox",
  "difficulty": "easy",
  "questUrl": "http://<quest-ui>/quest/<uuid>",
  "hint": "브라우저를 열어 이 URL을 방문하고 퀘스트를 완료하세요!",
  "settleTx": "0x..."
}
```

`questUrl`을 브라우저에서 열어 퀘스트를 완료합니다.

---

## 에러 처리

| 코드 | 원인 | 조치 |
|------|------|------|
| `402` | 결제 헤더 없음 또는 서명 검증 실패 | 서명 파라미터 확인 |
| `400` | X-PAYMENT 파싱 오류 | 인코딩 방식 확인 |
| `403` | 미등록 사용자 | `/x402-quest` 로 Step 0부터 시작 |
| `502` | facilitator 연결 실패 | facilitator `/health` 확인 |
