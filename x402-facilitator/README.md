# x402 Avalanche L1 Facilitator

This directory contains a self-hosted x402 facilitator for an EVM-based
Avalanche L1. It verifies x402 payment signatures and submits settlement
transactions on your L1.

The facilitator is meant to be called by your x402-protected resource server,
not directly by normal end users. A typical flow is:

1. A client requests a paid resource.
2. The resource server returns `402 Payment Required` with payment requirements.
3. The client signs an x402 payment payload.
4. The resource server sends that payload to this facilitator's `/verify`.
5. After verification, the resource server calls `/settle`.
6. The facilitator broadcasts the settlement transaction on your Avalanche L1.

## What It Provides

- `POST /verify` validates a submitted x402 payment payload.
- `POST /settle` sends the on-chain settlement transaction.
- `GET /supported` returns the x402 schemes and networks this facilitator supports.
- `GET /health` returns basic service and chain configuration.
- [USAGE_KOR.md](./USAGE_KOR.md) documents how to call the deployed facilitator.
- [openapi.yaml](./openapi.yaml) describes the HTTP API for Swagger/OpenAPI tools.

## Requirements

- Node.js 20 or newer.
- An EVM-compatible Avalanche L1 RPC endpoint.
- The L1 `chainId`.
- A dedicated facilitator wallet private key.
- Native gas token on the facilitator wallet.
- A payment token available on the L1.

Use a dedicated facilitator wallet. This wallet pays gas for settlement and
should be separate from the seller `payTo` wallet and buyer wallets.

## Quick Start

```powershell
cd "\facilitator"
Copy-Item .env.example .env
npm install
npm run start
```

Then check the service:

```powershell
Invoke-RestMethod http://localhost:4022/health
Invoke-RestMethod http://localhost:4022/supported
```

## Environment

Copy [.env.example](./.env.example) to `.env` and fill in your L1 values.

```env
PORT=4022
EVM_CHAIN_ID=12345
EVM_CHAIN_NAME=My Avalanche L1
EVM_RPC_URL=https://your-avalanche-l1-rpc.example
EVM_PRIVATE_KEY=0x...
DEPLOY_ERC4337_WITH_EIP6492=false
SIMULATE_IN_SETTLE=false
```

| Variable                      | Required | Description                                                            |
| ----------------------------- | -------- | ---------------------------------------------------------------------- |
| `PORT`                        | No       | HTTP port. Defaults to `4022`.                                         |
| `EVM_CHAIN_ID`                | Yes      | Your Avalanche L1 EVM chain ID.                                        |
| `EVM_CHAIN_NAME`              | No       | Human-readable chain name used by the viem chain config.               |
| `EVM_RPC_URL`                 | Yes      | RPC endpoint for your Avalanche L1.                                    |
| `EVM_PRIVATE_KEY`             | Yes      | Facilitator settlement wallet private key.                             |
| `EVM_NATIVE_NAME`             | No       | Native currency name. Defaults to `AVAX`.                              |
| `EVM_NATIVE_SYMBOL`           | No       | Native currency symbol. Defaults to `AVAX`.                            |
| `DEPLOY_ERC4337_WITH_EIP6492` | No       | Enables optional smart wallet deployment support. Defaults to `false`. |
| `SIMULATE_IN_SETTLE`          | No       | Runs simulation again during settlement. Defaults to `false`.          |

## Network Identifier

The service registers one EVM network in CAIP-2 format:

```text
eip155:<EVM_CHAIN_ID>
```

For example, if `EVM_CHAIN_ID=12345`, the x402 network is:

```text
eip155:12345
```

Your resource server and clients must use the same network value in
`paymentRequirements.network` and `paymentPayload.accepted.network`.

## Payment Token Choices

The easiest setup is an ERC-20 token that supports EIP-3009
`transferWithAuthorization`, such as USDC-style tokens. In that mode, the buyer
signs a one-time authorization and the facilitator pays only the settlement gas.

If your token is a plain ERC-20, x402 can use Permit2. That requires the Permit2
contract and the x402 exact Permit2 proxy to be available on your L1. Buyers may
also need a one-time approval path unless you add a gas-sponsoring extension.

## API Summary

### GET /health

Returns current service status.

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

Returns supported x402 payment kinds and facilitator signer addresses.

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

Verifies a payment payload against the payment requirements.

```http
POST /verify
Content-Type: application/json
```

The facilitator request envelope must include top-level `x402Version: 2`.

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

Success response:

```json
{
  "isValid": true,
  "payer": "0xBuyerAddress"
}
```

Failure response:

```json
{
  "isValid": false,
  "invalidReason": "invalid_signature",
  "payer": "0xBuyerAddress"
}
```

### POST /settle

Settles a verified payment on-chain. The request body is the same shape as
`POST /verify`.

```json
{
  "success": true,
  "transaction": "0xSettlementTxHash",
  "network": "eip155:12345",
  "payer": "0xBuyerAddress"
}
```

Settlement failure:

```json
{
  "success": false,
  "transaction": "",
  "network": "eip155:12345",
  "payer": "0xBuyerAddress",
  "errorReason": "insufficient_balance"
}
```

## Resource Server Integration

Your protected API should point to this facilitator:

```env
FACILITATOR_URL=http://localhost:4022
X402_NETWORK=eip155:12345
X402_ASSET=0xTokenAddress
X402_PAY_TO=0xSellerAddress
```

The resource server should return payment requirements on unpaid requests, then
call this facilitator for verification and settlement after the client submits a
payment payload.

Minimal server-side pseudo-flow:

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

// 1. If no payment was sent, return HTTP 402 with requirements.
// 2. If payment was sent, POST { x402Version: 2, paymentPayload, paymentRequirements }
//    to FACILITATOR_URL/verify.
// 3. If valid, POST the same body to FACILITATOR_URL/settle.
// 4. If settlement succeeds, return the protected resource.
```

## Swagger / OpenAPI

Open [openapi.yaml](./openapi.yaml) in one of these tools:

- [Swagger Editor](https://editor.swagger.io/)
- Swagger UI
- Redoc
- Postman import

Local preview examples:

```powershell
npx @redocly/cli preview-docs openapi.yaml
```

```powershell
npx swagger-ui-watcher openapi.yaml
```

## Production Checklist

- Put the facilitator behind HTTPS.
- Keep `EVM_PRIVATE_KEY` out of logs, repos, and frontend bundles.
- Use a dedicated wallet with limited native gas balance.
- Monitor `/settle` failures and gas spend.
- Rate-limit `/verify` and `/settle`.
- Restrict access if this facilitator is only for your own resource servers.
- Confirm the payment token method: EIP-3009 or Permit2.
- Test on a low-value token before production.

## Troubleshooting

| Symptom                 | Likely Cause                                                   | Fix                                                                    |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `unsupported_network`   | Request uses a different network string.                       | Use `eip155:<EVM_CHAIN_ID>`.                                           |
| `invalid_signature`     | Wrong EIP-712 domain, token name/version, chain ID, or signer. | Check `extra.name`, `extra.version`, `network`, and token address.     |
| `insufficient_balance`  | Buyer does not have enough payment token.                      | Fund the buyer wallet.                                                 |
| Settlement tx fails     | Facilitator wallet lacks gas or token method is not supported. | Fund facilitator gas wallet and verify token support.                  |
| Permit2 allowance error | Plain ERC-20 lacks approval setup.                             | Add Permit2/proxy deployment and approval flow, or use EIP-3009 token. |
