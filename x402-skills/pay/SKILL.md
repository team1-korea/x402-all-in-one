---
name: x402-pay
description: x402 엔드포인트의 결제 요건을 확인하고 TONE 토큰(EIP-3009)으로 결제하여 유료 API를 호출합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 결제 및 호출

## 네트워크 정보

| 항목            | 값                                                         |
|-----------------|-------------------------------------------------------------|
| Chain ID        | 402                                                         |
| RPC URL         | https://subnets.avax.network/apix/testnet/rpc               |
| Facilitator     | https://unloc.kr/facilitator                                |
| TONE 토큰       | 0x6ac929821e85970910f5dbafaee81823d71b17f3                  |
| EIP-712 name    | TONE                                                        |
| EIP-712 version | 1                                                           |

## 1단계: 결제 요건 확인

결제 없이 유료 엔드포인트를 호출하면 402 응답으로 결제 요건이 반환됩니다:

```bash
curl -i http://localhost:4010/v1/quest/quest-2
```

응답 (HTTP 402):

```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:402",
    "asset": "0x6ac929821e85970910f5dbafaee81823d71b17f3",
    "amount": "10000000000000000",
    "payTo": "0x7486fE46d82541ac4ae3b09b9a7061b8123A61Ba",
    "maxTimeoutSeconds": 60,
    "extra": { "assetTransferMethod": "eip3009", "name": "TONE", "version": "1" }
  }],
  "error": "결제가 필요합니다"
}
```

## 2단계: EIP-3009 서명 + X-PAYMENT 헤더 생성

`accepts[0]` 정보를 기반으로 `TransferWithAuthorization` 서명을 생성합니다.

```js
import { privateKeyToAccount } from 'viem/accounts';
import { randomBytes } from 'crypto';

const privateKey = '<등록 시 받은 privateKey>';
const account = privateKeyToAccount(privateKey);

const TOKEN   = '0x6ac929821e85970910f5dbafaee81823d71b17f3';
const PAY_TO  = '0x7486fE46d82541ac4ae3b09b9a7061b8123A61Ba';
const AMOUNT  = '10000000000000000'; // 0.01 TONE (wei)
const QUEST   = 'quest-2';           // 호출할 퀘스트 ID

const now   = Math.floor(Date.now() / 1000);
const nonce = '0x' + randomBytes(32).toString('hex');

// EIP-712 도메인 (TONE 컨트랙트 고정값)
const domain = { name: 'TONE', version: '1', chainId: 402, verifyingContract: TOKEN };

const types = {
  TransferWithAuthorization: [
    { name: 'from',        type: 'address' },
    { name: 'to',          type: 'address' },
    { name: 'value',       type: 'uint256' },
    { name: 'validAfter',  type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce',       type: 'bytes32' },
  ],
};

const message = {
  from:        account.address,
  to:          PAY_TO,
  value:       BigInt(AMOUNT),
  validAfter:  0n,
  validBefore: BigInt(now + 60),
  nonce,
};

const signature = await account.signTypedData({
  domain, types, primaryType: 'TransferWithAuthorization', message,
});

// paymentPayload 조립
const paymentPayload = {
  x402Version: 2,
  resource: {
    url: `http://localhost:4010/v1/quest/${QUEST}`,
    description: `Quest ${QUEST} access payment`,
    mimeType: 'application/json',
  },
  accepted: {
    scheme: 'exact', network: 'eip155:402', asset: TOKEN,
    amount: AMOUNT, payTo: PAY_TO, maxTimeoutSeconds: 60,
    extra: { assetTransferMethod: 'eip3009', name: 'TONE', version: '1' },
  },
  payload: {
    signature,
    authorization: {
      from: account.address, to: PAY_TO, value: AMOUNT,
      validAfter: '0', validBefore: String(now + 60), nonce,
    },
  },
};

const xPayment = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
```

## 3단계: 결제 헤더 포함 재요청

```bash
curl http://localhost:4010/v1/quest/quest-2 \
  -H "X-PAYMENT: <위에서 생성한 base64 문자열>"
```

또는 Node.js에서:

```js
const res = await fetch(`http://localhost:4010/v1/quest/${QUEST}`, {
  headers: { 'X-PAYMENT': xPayment },
});
const data = await res.json();
// data.question, data.choices, data.settleTx
```

성공 응답:

```json
{
  "id": "quest-2",
  "name": "퀘스트 2 — Avalanche L1",
  "question": "...",
  "choices": ["43114", "43113", "402", "1"],
  "reward": "0.015 TONE",
  "settleTx": "0x..."
}
```

## 4단계: 정답 제출

```bash
curl -X POST http://localhost:4010/v1/quest/quest-2/answer \
  -H "Content-Type: application/json" \
  -d '{"answerIndex": <선택 index>, "walletAddress": "<내 지갑 주소>"}'
```

정답 응답:

```json
{
  "correct": true,
  "message": "정답입니다! 0.015 TONE를 에어드랍했습니다.",
  "airdropTx": "0x...",
  "nextQuestHint": "다음: /v1/quest/quest-3"
}
```

## 에러 처리

| 상태 | 원인 | 해결 |
|------|------|------|
| `402` | 결제 헤더 없음 또는 서명 검증 실패 | 1단계부터 재시작 |
| `400` | payload 파싱 오류 | base64 인코딩 확인 |
| `502` | facilitator 연결 실패 | https://unloc.kr/facilitator/health 확인 |

## TONE 단위 (wei)

| wei                  | TONE     |
|----------------------|----------|
| 10000000000000000    | 0.01 TONE |
| 15000000000000000    | 0.015 TONE |
| 20000000000000000    | 0.02 TONE |
| 30000000000000000    | 0.03 TONE |
