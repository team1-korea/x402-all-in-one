---
name: x402-pay
description: x402 엔드포인트의 결제 요건을 확인하고 TONE 토큰(EIP-3009)으로 결제하여 유료 API를 호출합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 결제 방법

## 네트워크 정보 (고정값 — 수정 금지)

| 항목            | 값                                                          |
|-----------------|-------------------------------------------------------------|
| Chain ID        | 402                                                         |
| RPC URL         | https://subnets.avax.network/apix/testnet/rpc               |
| Facilitator     | https://unloc.kr/facilitator                                |
| TONE 토큰       | 0x6ac929821e85970910f5dbafaee81823d71b17f3                  |
| EIP-712 name    | TONE                                                        |
| EIP-712 version | 1                                                           |
| x402Version     | 2 (paymentPayload에 반드시 2 사용)                          |

## 결제 페이로드 구조 (고정값 — 수정 금지)

```json
{
  "x402Version": 2,
  "resource": {
    "url": "<요청 URL>",
    "description": "<설명>",
    "mimeType": "application/json"
  },
  "accepted": {
    "scheme": "exact",
    "network": "eip155:402",
    "asset": "<TONE 토큰 주소>",
    "amount": "<wei 단위 금액 문자열>",
    "payTo": "<수신 지갑 주소>",
    "maxTimeoutSeconds": 60,
    "extra": { "assetTransferMethod": "eip3009", "name": "TONE", "version": "1" }
  },
  "payload": {
    "signature": "<EIP-712 서명>",
    "authorization": {
      "from": "<내 지갑>",
      "to": "<수신 지갑>",
      "value": "<금액 문자열 (BigInt 아님)>",
      "validAfter": "0",
      "validBefore": "<Unix timestamp 문자열>",
      "nonce": "<0x + 32바이트 hex>"
    }
  }
}
```

전체 paymentPayload를 **base64로 인코딩**하여 `X-PAYMENT` 헤더에 담는다.

---

## 전체 흐름 — 빈칸을 채워주세요

아래 흐름에서 `[TODO: ...]` 부분을 자연어로 채워주세요.
아이폰을 사러 애플스토어에 가는 것처럼 생각하면 됩니다.

---

**1단계.** 유료 엔드포인트에 X-PAYMENT 없이 GET 요청을 보낸다.

**2단계.** 서버가 HTTP `[TODO: 몇 번 응답을 돌려보내나요?]` 로 응답한다.  
응답 본문의 `accepts[0]` 에는 `[TODO: 어떤 정보들이 들어있나요? (어느 체인인지, 얼마인지, 어느 지갑으로 보내야 하는지)]` 가 담겨있다.

**3단계.** 그 정보를 꺼내 EIP-3009 `TransferWithAuthorization` 서명을 만든다.  
`authorization` 메시지에는:
- `from`: 내 지갑 주소
- `to`: `[TODO: 받는 지갑 주소는 응답의 어느 필드에서 가져오나요?]`
- `value`: `[TODO: 금액은 응답의 어느 필드에서 가져오나요?]` (BigInt로 변환)
- `validAfter`: `0`
- `validBefore`: `[TODO: 이 서명이 언제까지 유효해야 하나요?]` (Unix timestamp)
- `nonce`: `0x` + 32바이트 랜덤 hex (`randomBytes(32).toString('hex')`)

viem의 `account.signTypedData()` 로 서명한다.

**4단계.** `authorization.value` 를 **문자열로 변환**한 뒤 paymentPayload를 조립한다.  
전체를 `[TODO: 어떤 인코딩 방식으로 변환해야 하나요?]` 하여 `X-PAYMENT` 헤더에 담는다.

**5단계.** `[TODO: 어떤 HTTP 메서드로]` 같은 URL로 `X-PAYMENT` 헤더를 포함해 다시 요청한다.

**6단계.** 서버는 요청을 `[TODO: 누구에게 넘겨서 검증하나요?]` 에게 전달하여 검증을 맡긴다.

**7단계.** 검증과 정산이 완료되면 서버가 `[TODO: 최종적으로 우리에게 무엇을 돌려주나요?]` 를 응답으로 준다.

---

## 구현 코드 스켈레톤 (viem)

```js
import { privateKeyToAccount } from 'viem/accounts';
import { randomBytes } from 'crypto';

const account = privateKeyToAccount('<등록 시 받은 privateKey>');

// 1단계: 유료 엔드포인트 호출
const firstRes = await fetch('<URL>');
// 위 흐름 2단계에 따라 응답 처리 ...

const { accepts } = await firstRes.json();
const req = accepts[0];

const now = Math.floor(Date.now() / 1000);
const nonce = '0x' + randomBytes(32).toString('hex');

// 위 흐름 3단계에 따라 서명 생성 ...
const domain = {
  name: 'TONE', version: '1', chainId: 402,
  verifyingContract: req.asset,
};
const types = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};
const message = {
  from: account.address,
  to: /* 흐름 3단계 참고 */,
  value: BigInt(/* 흐름 3단계 참고 */),
  validAfter: 0n,
  validBefore: BigInt(/* 흐름 3단계 참고 */),
  nonce,
};
const signature = await account.signTypedData({ domain, types, primaryType: 'TransferWithAuthorization', message });

// 위 흐름 4단계에 따라 paymentPayload 조립 후 인코딩 ...
const paymentPayload = {
  x402Version: 2,
  resource: { url: '<URL>', description: 'Quest access', mimeType: 'application/json' },
  accepted: req,
  payload: {
    signature,
    authorization: {
      from: account.address,
      to: /* 흐름 3단계 참고 */,
      value: String(BigInt(/* 흐름 3단계 참고 */)),
      validAfter: '0',
      validBefore: String(/* 흐름 3단계 참고 */),
      nonce,
    },
  },
};
const xPayment = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

// 위 흐름 5단계에 따라 재요청 ...
const finalRes = await fetch('<URL>', { headers: { 'X-PAYMENT': xPayment } });
const data = await finalRes.json();
```
