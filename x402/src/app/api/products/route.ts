import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { withFileLock } from '../../../core/lock';
import { sendSeedFaucet } from '../../../core/reward';

export async function GET() {
  const productsFile = path.join(process.cwd(), 'runtime/products.json');
  try {
    const data = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, productId, walletAddress } = await req.json();
  const productsFile = path.join(process.cwd(), 'runtime/products.json');
  const pathsFile = path.join(process.cwd(), 'runtime/paths.json');
  const playersFile = path.join(process.cwd(), 'runtime/players.json');

  try {
    return await withFileLock('players', async () => {
      const products = JSON.parse(fs.readFileSync(productsFile, 'utf8')).products;
      const product = products.find((p: any) => p.productId === productId);
      
      if (!product || product.stock <= 0) {
        return Response.json({ error: 'Product unavailable' }, { status: 400 });
      }

      const pathsData = JSON.parse(fs.readFileSync(pathsFile, 'utf8'));
      const pathChoice = pathsData.paths.find((p: any) => p.productId === productId && p.status === 'active');

      if (!pathChoice) {
        return Response.json({ error: 'No paths available' }, { status: 400 });
      }

      const playersData = JSON.parse(fs.readFileSync(playersFile, 'utf8'));
      const playerIndex = playersData.players.findIndex((p: any) => p.userId === userId);
      
      const newPlayerData = {
        userId,
        walletAddress: walletAddress || playersData.players.find((p: any) => p.userId === userId)?.walletAddress,
        selectedProductId: productId,
        selectedPathId: pathChoice.pathId,
        currentQuizIndex: 1,
        status: 'in_progress',
        updatedAt: new Date().toISOString()
      };

      if (playerIndex > -1) playersData.players[playerIndex] = { ...playersData.players[playerIndex], ...newPlayerData };
      else playersData.players.push(newPlayerData);

      fs.writeFileSync(playersFile, JSON.stringify(playersData, null, 2));

      // Trigger Seed Faucet for the new player
      if (newPlayerData.walletAddress) {
        sendSeedFaucet(newPlayerData.walletAddress).catch(e => console.error('Seed faucet failed:', e));
      }

      return Response.json({ ok: true, selectedPathId: pathChoice.pathId, status: 'selected' });
    });
  } catch (e) {
    return Response.json({ error: 'Selection failed' }, { status: 500 });
  }
}
