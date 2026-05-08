import fs from 'fs';
import path from 'path';
import { AvalancheProvider } from './avalanche-provider';

// Standard X402 Verification using Avalanche SDK
export async function verifyX402Payment(txHash: string): Promise<boolean> {
  const provider = AvalancheProvider.getInstance();
  const gatewayAddress = process.env.GATEWAY_ADDRESS;
  const runtimeDir = path.join(process.cwd(), 'runtime');
  const actionsFile = path.join(runtimeDir, 'actions.json');

  if (!gatewayAddress) {
    throw new Error('GATEWAY_ADDRESS not configured');
  }

  try {
    // 0. Simulation Mode Check
    if (process.env.MOCK_MODE === 'true') {
      console.log(`[MOCK] Auto-verifying Tx: ${txHash}`);
      return true;
    }

    // Ensure runtime dir exists
    if (!fs.existsSync(runtimeDir)) fs.mkdirSync(runtimeDir);
    if (!fs.existsSync(actionsFile)) fs.writeFileSync(actionsFile, JSON.stringify({ actions: [] }));

    // 1. Idempotency Check (Local)
    const actionsData = JSON.parse(fs.readFileSync(actionsFile, 'utf8'));
    if (actionsData.actions.includes(txHash)) {
      console.warn(`[X402] Replay attack detected for Tx: ${txHash}`);
      return false;
    }

    // 2. On-Chain Verification
    // Use raw JSON-RPC call via fetch for maximum compatibility with v3
    const rpcUrl = process.env.RPC_URL || 'https://api.avax.network/ext/bc/C/rpc';
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      })
    });
    const { result: receipt } = await response.json();
    
    if (!receipt || receipt.status !== '0x1') {
      return false;
    }

    // 3. Dest Check
    const txResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionByHash',
        params: [txHash]
      })
    });
    const { result: tx } = await txResponse.json();

    const toAddress = tx.to.toLowerCase();
    const targetAddress = gatewayAddress.toLowerCase();

    if (toAddress !== targetAddress) {
      console.warn(`[X402] Payment recipient mismatch. Expected: ${targetAddress}, Got: ${toAddress}`);
      return false;
    }

    // 4. Register Action to prevent replay
    actionsData.actions.push(txHash);
    fs.writeFileSync(actionsFile, JSON.stringify(actionsData, null, 2));

    return true;
  } catch (e) {
    console.error(`[X402] Verification failed for ${txHash}:`, e);
    return false;
  }
}

export function getPaymentJWT(amount: number): string {
    // Standard JWT generation would go here. 
    // In event flow, this is simple metadata for the client.
    return Buffer.from(JSON.stringify({ amount, timestamp: Date.now() })).toString('base64');
}
