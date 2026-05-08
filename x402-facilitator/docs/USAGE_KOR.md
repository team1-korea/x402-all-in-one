# x402 Facilitator 사용 가이드

이 문서는 배포된 x402 facilitator를 resource server나 테스트 클라이언트에서 호출하는 방법을 설명합니다.

현재 배포 기준 URL은 다음과 같습니다.

```text
https://unloc.kr/facilitator
```

주의: 외부 URL path는 Nginx 설정에 맞춰 `/facilitator`를 사용합니다. 서버 내부 systemd 배포 디렉터리 이름과 외부 URL path는 서로 달라도 됩니다.

## 역할

facilitator는 사용자의 API 서버가 직접 처리하기 어려운 x402 결제 검증과 온체인 정산을 대신 수행합니다.

facilitator가 하는 일:

- x402 v2 payment payload 형식 검증
- payment payload가 payment requirements와 일치하는지 검증
- EVM `exact` scheme 결제 서명 검증
- 유효한 결제를 Avalanche L1에 settlement transaction으로 제출
- 지원하는 x402 scheme/network 정보 제공

facilitator가 하지 않는 일:

- 유료 API route 자체를 보호하지 않습니다.
- 클라이언트에게 `402 Payment Required` 응답을 직접 만들지 않습니다.
- `paymentRequirements`를 임의로 정하지 않습니다.
- 판매자 비즈니스 로직, 권한, 상품 제공 여부를 판단하지 않습니다.

즉, `paymentRequirements`는 resource server가 먼저 만들고, facilitator는 그 조건에 맞는 결제인지 검증/정산합니다.

## 전체 흐름

1. 클라이언트가 resource server의 유료 API를 호출합니다.
2. resource server는 결제가 없으면 `402 Payment Required`와 `paymentRequirements`를 반환합니다.
3. 클라이언트는 해당 `paymentRequirements`에 맞춰 지갑에서 x402 payment payload를 서명합니다.
4. 클라이언트는 같은 API를 다시 호출하면서 x402 payment payload를 전달합니다.
5. resource server는 `{ x402Version: 2, paymentPayload, paymentRequirements }`를 facilitator의 `/verify`로 보냅니다.
6. `/verify`가 `isValid: true`를 반환하면 resource server는 요청 처리를 진행합니다.
7. 응답을 확정한 뒤 resource server는 같은 body를 facilitator의 `/settle`로 보냅니다.
8. `/settle`은 Avalanche L1에 결제 정산 트랜잭션을 제출하고 tx hash를 반환합니다.

## 엔드포인트

### `GET /health`

서비스 상태와 연결된 L1 정보를 확인합니다.

```bash
curl https://unloc.kr/facilitator/health
```

예시 응답:

```json
{
  "status": "ok",
  "network": "eip155:402",
  "chainId": 402,
  "rpcUrl": "https://subnets.avax.network/apix/testnet/rpc",
  "facilitatorAddress": "0x1061538525312768d0da8b9E7a44a5757291fB5E"
}
```

### `GET /supported`

facilitator가 지원하는 x402 scheme과 network를 확인합니다.

```bash
curl https://unloc.kr/facilitator/supported
```

예시 응답:

```json
{
  "kinds": [
    {
      "x402Version": 2,
      "scheme": "exact",
      "network": "eip155:402"
    }
  ],
  "extensions": [],
  "signers": {
    "eip155:*": ["0x1061538525312768d0da8b9E7a44a5757291fB5E"]
  }
}
```

### `POST /verify`

결제 payload가 resource server가 요구한 payment requirements와 맞는지 검증합니다.

```bash
curl -X POST https://unloc.kr/facilitator/verify \
  -H "Content-Type: application/json" \
  -d @verify-request.json
```

요청 body는 반드시 top-level `x402Version: 2`를 포함해야 합니다.

```json
{
  "x402Version": 2,
  "paymentPayload": {
    "x402Version": 2,
    "accepted": {
      "scheme": "exact",
      "network": "eip155:402",
      "asset": "0xTokenAddress",
      "amount": "1000000",
      "payTo": "0xSellerAddress",
      "maxTimeoutSeconds": 300,
      "extra": {
        "assetTransferMethod": "eip3009",
        "name": "USDC",
        "version": "2"
      }
    },
    "payload": {
      "signature": "0x...",
      "authorization": {
        "from": "0xBuyerAddress",
        "to": "0xSellerAddress",
        "value": "1000000",
        "validAfter": "0",
        "validBefore": "1770000000",
        "nonce": "0x..."
      }
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "eip155:402",
    "asset": "0xTokenAddress",
    "amount": "1000000",
    "payTo": "0xSellerAddress",
    "maxTimeoutSeconds": 300,
    "extra": {
      "assetTransferMethod": "eip3009",
      "name": "USDC",
      "version": "2"
    }
  }
}
```

성공 응답:

```json
{
  "isValid": true,
  "payer": "0xBuyerAddress"
}
```

실패 응답:

```json
{
  "isValid": false,
  "invalidReason": "invalid_exact_evm_signature",
  "invalidMessage": "Invalid EIP-3009 signature",
  "payer": "0xBuyerAddress"
}
```

### `POST /settle`

검증된 결제를 온체인에 정산합니다. 요청 body는 `/verify`와 동일합니다.

```bash
curl -X POST https://unloc.kr/facilitator/settle \
  -H "Content-Type: application/json" \
  -d @verify-request.json
```

성공 응답:

```json
{
  "success": true,
  "transaction": "0xSettlementTransactionHash",
  "network": "eip155:402",
  "payer": "0xBuyerAddress"
}
```

실패 응답:

```json
{
  "success": false,
  "transaction": "",
  "network": "eip155:402",
  "errorReason": "invalid_exact_evm_signature",
  "errorMessage": "Invalid EIP-3009 signature",
  "payer": "0xBuyerAddress"
}
```

## paymentRequirements 작성 기준

resource server는 유료 리소스마다 아래 값을 직접 정해야 합니다.

| 필드 | 설명 |
| --- | --- |
| `scheme` | 현재 facilitator는 `"exact"`를 지원합니다. |
| `network` | Avalanche L1의 CAIP-2 network id입니다. 현재 값은 `"eip155:402"`입니다. |
| `asset` | 결제에 사용할 ERC-20 token contract address입니다. |
| `amount` | token 최소 단위 기준 결제 금액입니다. 예: USDC 6 decimals에서 1 USDC는 `"1000000"`입니다. |
| `payTo` | 결제 금액을 받을 판매자 주소입니다. |
| `maxTimeoutSeconds` | 서명 유효 시간 제한입니다. |
| `extra.assetTransferMethod` | `"eip3009"` 또는 `"permit2"`를 사용합니다. |
| `extra.name` | token EIP-712 domain name입니다. EIP-3009에서는 필요합니다. |
| `extra.version` | token EIP-712 domain version입니다. EIP-3009에서는 필요합니다. |

## 검증 시 비교되는 값

EIP-3009 기준으로 facilitator는 대략 아래 항목을 확인합니다.

- `paymentPayload.accepted.network`와 `paymentRequirements.network`가 같은지 확인합니다.
- 서명 domain의 chain id가 `paymentRequirements.network`와 맞는지 확인합니다.
- `authorization.to`가 `paymentRequirements.payTo`와 같은지 확인합니다.
- `authorization.value`가 `paymentRequirements.amount`와 같은지 확인합니다.
- `authorization.validBefore`가 아직 만료되지 않았는지 확인합니다.
- `authorization.validAfter`가 미래 시간이 아닌지 확인합니다.
- token contract에서 `transferWithAuthorization`을 실행할 수 있는지 시뮬레이션/정산합니다.

## resource server 연동 예시

아래 코드는 개념 예시입니다. 실제 프로젝트에서는 결제 payload를 어디서 받는지에 맞게 조정하세요.

```ts
const FACILITATOR_URL = "https://unloc.kr/facilitator";

async function verifyPayment(paymentPayload: unknown, paymentRequirements: unknown) {
  const response = await fetch(`${FACILITATOR_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      x402Version: 2,
      paymentPayload,
      paymentRequirements,
    }),
  });

  if (!response.ok) {
    throw new Error(`facilitator verify failed: ${response.status}`);
  }

  return response.json() as Promise<{
    isValid: boolean;
    invalidReason?: string;
    invalidMessage?: string;
    payer?: string;
  }>;
}

async function settlePayment(paymentPayload: unknown, paymentRequirements: unknown) {
  const response = await fetch(`${FACILITATOR_URL}/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      x402Version: 2,
      paymentPayload,
      paymentRequirements,
    }),
  });

  if (!response.ok) {
    throw new Error(`facilitator settle failed: ${response.status}`);
  }

  return response.json() as Promise<{
    success: boolean;
    transaction: string;
    network: string;
    errorReason?: string;
    errorMessage?: string;
    payer?: string;
  }>;
}
```

## 운영 명령어

서버 내부에서 facilitator 상태 확인:

```bash
sudo systemctl status x402-faciliator
sudo journalctl -u x402-faciliator -n 120 --no-pager
```

재시작:

```bash
sudo systemctl restart x402-faciliator
```

내부 health check:

```bash
curl http://127.0.0.1:4022/health
```

외부 health check:

```bash
curl https://unloc.kr/facilitator/health
```

## Nginx 연결 방식

Nginx는 외부 요청의 `/facilitator/*` prefix를 제거하고 내부 Node 서버로 전달합니다.

```nginx
location = /facilitator {
    return 301 /facilitator/;
}

location ^~ /facilitator/ {
    proxy_pass http://127.0.0.1:4022/;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

중요한 부분은 `proxy_pass http://127.0.0.1:4022/;`의 마지막 `/`입니다. 이 설정 때문에:

```text
https://unloc.kr/facilitator/verify
```

가 내부적으로:

```text
http://127.0.0.1:4022/verify
```

로 전달됩니다.

## 보안 주의사항

- `.env`의 `EVM_PRIVATE_KEY`는 절대 git에 올리지 마세요.
- 외부에는 Nginx HTTPS만 열고, `4022` 포트는 서버 내부 `127.0.0.1`에서만 접근하게 두는 것을 권장합니다.
- `/verify`, `/settle`에는 rate limit을 적용하는 것이 좋습니다.
- facilitator wallet에는 settlement gas에 필요한 native token만 보관하세요.
- `payTo` 주소는 facilitator wallet과 분리하는 것을 권장합니다.

## 문제 해결

| 증상 | 확인할 것 |
| --- | --- |
| `Cannot find package '@x402/core'` | `/var/www/unloc.kr/faciliator`에서 `npm ci --omit=dev`를 실행했는지 확인합니다. |
| `EVM_PRIVATE_KEY environment variable is required` | `.env`에 필수 환경 변수가 들어 있는지 확인합니다. |
| `curl http://127.0.0.1:4022/health` 실패 | `sudo systemctl status x402-faciliator`와 `journalctl` 로그를 확인합니다. |
| 내부 health는 되는데 외부 URL이 실패 | Nginx location과 `proxy_pass` 설정, `sudo nginx -t` 결과를 확인합니다. |
| `/verify`가 `invalid_x402_version` 반환 | 요청 body top-level에 `"x402Version": 2`가 있는지 확인합니다. |
| `/verify`가 signature 관련 실패 반환 | token domain `name/version`, `chainId`, `asset`, `payTo`, `amount`, signature가 모두 같은 조건에서 생성됐는지 확인합니다. |

## OpenAPI

Swagger UI, Stoplight, Postman 등에 다음 파일을 import하면 API를 테스트할 수 있습니다.

```text
openapi.yaml
```

배포 서버 URL은 OpenAPI `servers`에 포함되어 있습니다.
