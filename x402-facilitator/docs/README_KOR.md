# x402 Avalanche L1 Facilitator 한국어 가이드

이 폴더는 EVM 기반 Avalanche L1에서 동작하는 self-hosted x402 facilitator입니다.
facilitator는 x402 결제 서명을 검증하고, 실제 정산 트랜잭션을 여러분의 L1에 제출합니다.

일반 사용자가 이 facilitator를 직접 호출하는 구조가 아닙니다. 보통은 x402로 보호된
resource server가 이 facilitator를 호출합니다.

전체 흐름은 다음과 같습니다.

1. 클라이언트가 유료 리소스를 요청합니다.
2. resource server가 결제 조건과 함께 `402 Payment Required`를 반환합니다.
3. 클라이언트가 x402 payment payload에 서명합니다.
4. resource server가 해당 payload를 facilitator의 `/verify`로 보냅니다.
5. 검증에 성공하면 resource server가 `/settle`을 호출합니다.
6. facilitator가 Avalanche L1에 settlement 트랜잭션을 브로드캐스트합니다.

## 제공 기능

- `POST /verify`: 제출된 x402 payment payload를 검증합니다.
- `POST /settle`: 검증된 결제를 온체인에 정산합니다.
- `GET /supported`: 이 facilitator가 지원하는 x402 scheme과 network를 반환합니다.
- `GET /health`: 서비스 상태와 체인 설정을 반환합니다.
- [USAGE_KOR.md](./USAGE_KOR.md): 배포된 facilitator를 resource server에서 호출하는 방법입니다.
- [openapi.yaml](./openapi.yaml): Swagger/OpenAPI 도구에서 열 수 있는 API 명세입니다.

## 준비물

- Node.js 20 이상.
- EVM 호환 Avalanche L1 RPC endpoint.
- L1 `chainId`.
- facilitator 전용 wallet private key.
- facilitator wallet에 들어 있는 L1 native gas token.
- L1에 배포된 결제용 token.

facilitator wallet은 settlement gas를 지불합니다. seller의 `payTo` wallet이나 buyer wallet과
분리된 전용 wallet을 사용하는 것이 좋습니다.

## 빠른 시작

```powershell
cd "\facilitator"
Copy-Item .env.example .env
npm install
npm run start
```

서비스가 뜨면 아래 명령으로 상태를 확인합니다.

```powershell
Invoke-RestMethod http://localhost:4022/health
Invoke-RestMethod http://localhost:4022/supported
```

## 환경 변수

[.env.example](./.env.example)을 `.env`로 복사한 뒤, 여러분의 Avalanche L1 값을 입력합니다.

```env
PORT=4022
EVM_CHAIN_ID=12345
EVM_CHAIN_NAME=My Avalanche L1
EVM_RPC_URL=https://your-avalanche-l1-rpc.example
EVM_PRIVATE_KEY=0x...
DEPLOY_ERC4337_WITH_EIP6492=false
SIMULATE_IN_SETTLE=false
```

| 변수                          | 필수   | 설명                                                                          |
| ----------------------------- | ------ | ----------------------------------------------------------------------------- |
| `PORT`                        | 아니오 | facilitator HTTP port입니다. 기본값은 `4022`입니다.                           |
| `EVM_CHAIN_ID`                | 예     | 여러분의 Avalanche L1 EVM chain ID입니다.                                     |
| `EVM_CHAIN_NAME`              | 아니오 | viem chain config에 표시할 사람이 읽기 쉬운 체인 이름입니다.                  |
| `EVM_RPC_URL`                 | 예     | Avalanche L1 RPC endpoint입니다.                                              |
| `EVM_PRIVATE_KEY`             | 예     | settlement transaction을 제출할 facilitator wallet private key입니다.         |
| `EVM_NATIVE_NAME`             | 아니오 | native currency 이름입니다. 기본값은 `AVAX`입니다.                            |
| `EVM_NATIVE_SYMBOL`           | 아니오 | native currency 심볼입니다. 기본값은 `AVAX`입니다.                            |
| `DEPLOY_ERC4337_WITH_EIP6492` | 아니오 | smart wallet deployment 지원을 켭니다. 기본값은 `false`입니다.                |
| `SIMULATE_IN_SETTLE`          | 아니오 | settlement 단계에서 simulation을 한 번 더 수행합니다. 기본값은 `false`입니다. |

## Network Identifier

이 facilitator는 EVM network를 CAIP-2 형식으로 하나 등록합니다.

```text
eip155:<EVM_CHAIN_ID>
```

예를 들어 `EVM_CHAIN_ID=12345`이면 x402 network 값은 다음과 같습니다.

```text
eip155:12345
```

resource server와 client는 반드시 같은 network 값을 사용해야 합니다.
즉 `paymentRequirements.network`와 `paymentPayload.accepted.network`가 모두 같은
`eip155:<EVM_CHAIN_ID>` 값이어야 합니다.

## 결제 Token 선택

가장 쉬운 구성은 EIP-3009 `transferWithAuthorization`을 지원하는 ERC-20 token을 사용하는 것입니다.
USDC 스타일 token이 여기에 해당합니다. 이 방식에서는 buyer가 일회성 authorization에 서명하고,
facilitator는 settlement gas만 대신 지불합니다.

일반 ERC-20 token을 사용한다면 x402는 Permit2 방식을 사용할 수 있습니다. 이 경우 여러분의 L1에
Permit2 contract와 x402 exact Permit2 proxy가 준비되어 있어야 합니다. gas sponsoring extension을
추가하지 않는다면 buyer에게 일회성 approval 과정이 필요할 수 있습니다.

## API 요약

### GET /health

현재 facilitator 상태를 반환합니다.

```json
{
  "status": "ok",
  "network": "eip155:12345",
  "chainId": 12345,
  "rpcUrl": "https://your-avalanche-l1-rpc.example",
  "facilitatorAddress": "0x..."
}
```

### GET /supported

지원하는 x402 payment kind와 facilitator signer address를 반환합니다.

```json
{
  "kinds": [
    {
      "x402Version": 2,
      "scheme": "exact",
      "network": "eip155:12345"
    }
  ],
  "extensions": [],
  "signers": {
    "eip155": ["0x..."]
  }
}
```

### POST /verify

payment payload가 payment requirements를 만족하는지 검증합니다.

```http
POST /verify
Content-Type: application/json
```

facilitator request envelope에는 top-level `x402Version: 2`가 반드시 포함되어야 합니다.

```json
{
  "x402Version": 2,
  "paymentPayload": {
    "x402Version": 2,
    "resource": {
      "url": "https://api.example.com/protected",
      "description": "Protected resource",
      "mimeType": "application/json"
    },
    "accepted": {
      "scheme": "exact",
      "network": "eip155:12345",
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
    "network": "eip155:12345",
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

검증 성공 응답:

```json
{
  "isValid": true,
  "payer": "0xBuyerAddress"
}
```

검증 실패 응답:

```json
{
  "isValid": false,
  "invalidReason": "invalid_signature",
  "payer": "0xBuyerAddress"
}
```

### POST /settle

검증된 결제를 온체인에 정산합니다. request body 구조는 `POST /verify`와 같습니다.

정산 성공 응답:

```json
{
  "success": true,
  "transaction": "0xSettlementTxHash",
  "network": "eip155:12345",
  "payer": "0xBuyerAddress"
}
```

정산 실패 응답:

```json
{
  "success": false,
  "transaction": "",
  "network": "eip155:12345",
  "payer": "0xBuyerAddress",
  "errorReason": "insufficient_balance"
}
```

## Resource Server 연동

x402로 보호할 API 서버는 이 facilitator URL을 바라보면 됩니다.

```env
FACILITATOR_URL=http://localhost:4022
X402_NETWORK=eip155:12345
X402_ASSET=0xTokenAddress
X402_PAY_TO=0xSellerAddress
```

resource server는 아직 결제가 없는 요청에 payment requirements를 반환하고, client가 payment payload를
제출하면 이 facilitator에 검증과 정산을 요청해야 합니다.

최소 server-side pseudo-flow는 다음과 같습니다.

```ts
const requirements = {
  scheme: "exact",
  network: process.env.X402_NETWORK,
  asset: process.env.X402_ASSET,
  amount: "1000000",
  payTo: process.env.X402_PAY_TO,
  maxTimeoutSeconds: 300,
  extra: {
    assetTransferMethod: "eip3009",
    name: "USDC",
    version: "2",
  },
};

// 1. payment가 없으면 requirements와 함께 HTTP 402를 반환합니다.
// 2. payment가 있으면 { x402Version: 2, paymentPayload, paymentRequirements }를
//    FACILITATOR_URL/verify로 POST합니다.
// 3. 검증이 성공하면 같은 body를 FACILITATOR_URL/settle로 POST합니다.
// 4. settlement가 성공하면 보호된 resource를 반환합니다.
```

## Swagger / OpenAPI

[openapi.yaml](./openapi.yaml)을 아래 도구에서 열 수 있습니다.

- [Swagger Editor](https://editor.swagger.io/)
- Swagger UI
- Redoc
- Postman import

로컬 preview 예시는 다음과 같습니다.

```powershell
npx @redocly/cli preview-docs openapi.yaml
```

```powershell
npx swagger-ui-watcher openapi.yaml
```

## 운영 체크리스트

- facilitator를 HTTPS 뒤에 배포합니다.
- `EVM_PRIVATE_KEY`가 log, repository, frontend bundle에 노출되지 않게 합니다.
- native gas balance를 제한한 전용 wallet을 사용합니다.
- `/settle` 실패와 gas 사용량을 모니터링합니다.
- `/verify`, `/settle`에 rate limit을 적용합니다.
- 내부 resource server만 사용할 facilitator라면 접근 제한을 둡니다.
- 결제 token 방식이 EIP-3009인지 Permit2인지 확인합니다.
- production 전에 낮은 금액의 token으로 end-to-end 테스트를 수행합니다.

## 문제 해결

| 증상                    | 가능성 높은 원인                                                      | 해결 방법                                                                    |
| ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `unsupported_network`   | request의 network string이 facilitator 설정과 다릅니다.               | `eip155:<EVM_CHAIN_ID>`를 사용하세요.                                        |
| `invalid_signature`     | EIP-712 domain, token name/version, chain ID, signer가 맞지 않습니다. | `extra.name`, `extra.version`, `network`, token address를 확인하세요.        |
| `insufficient_balance`  | buyer에게 결제 token balance가 부족합니다.                            | buyer wallet에 token을 충전하세요.                                           |
| settlement tx 실패      | facilitator wallet gas가 부족하거나 token 방식이 지원되지 않습니다.   | facilitator gas wallet을 충전하고 token 지원 방식을 확인하세요.              |
| Permit2 allowance error | 일반 ERC-20인데 approval 구성이 없습니다.                             | Permit2/proxy 배포와 approval flow를 추가하거나 EIP-3009 token을 사용하세요. |
