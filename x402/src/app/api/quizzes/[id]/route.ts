import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { withFileLock } from '../../../../core/lock';
import { verifyX402Payment } from '../../../../core/x402-sdk';
import { sendReward } from '../../../../core/reward';

const RUNTIME_DIR = path.join(process.cwd(), 'runtime');
const QUIZZES_FILE = path.join(process.cwd(), 'templates/quizzes.json');
const PLAYERS_FILE = path.join(RUNTIME_DIR, 'players.json');

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const quizId = params.id;
  const userId = req.headers.get('x-user-id');
  const txHash = req.headers.get('x-x402-token');
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  // [UX Safe Guard] Check if the selected product is still available
  const products = JSON.parse(fs.readFileSync(path.join(RUNTIME_DIR, 'products.json'), 'utf8')).products;
  const players = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8')).players;
  const player = players.find((p: any) => p.userId === userId);
  
  if (player) {
    const product = products.find((p: any) => p.productId === player.selectedProductId);
    if (!product || product.stock <= 0) {
      return NextResponse.json({ error: 'Product Sold Out during your play' }, { status: 410 });
    }
  }

  if (!txHash) {
    return NextResponse.json({
      error: 'payment_required',
      payTo: process.env.GATEWAY_ADDRESS,
      amount: '10 APIX'
    }, { status: 402 });
  }
  return await withFileLock('actions', async () => {
    const isPaid = await verifyX402Payment(txHash);
    if (!isPaid) return NextResponse.json({ error: 'Invalid payment' }, { status: 402 });

    // 1-1. Replay Protection
    const actionsFile = path.join(RUNTIME_DIR, 'actions.json');
    if (fs.existsSync(actionsFile)) {
      const actions = JSON.parse(fs.readFileSync(actionsFile, 'utf8')).actions;
      if (actions.some((a: any) => a.txHash === txHash)) {
        return NextResponse.json({ error: 'Payment already used' }, { status: 400 });
      }
    }

    // Update actions.json
    const currentActions = fs.existsSync(actionsFile) ? JSON.parse(fs.readFileSync(actionsFile, 'utf8')) : { actions: [] };
    currentActions.actions.push({ txHash, userId, timestamp: new Date().toISOString() });
    fs.writeFileSync(actionsFile, JSON.stringify(currentActions, null, 2));

    // 2. Fetch Quiz Details
    const quizzes = JSON.parse(fs.readFileSync(QUIZZES_FILE, 'utf8')).quizzes;
    const quiz = quizzes.find((q: any) => q.quizId === quizId);
    if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

    const { expectedAnswer, ...quizInfo } = quiz;
    return NextResponse.json(quizInfo);
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const quizId = params.id;
  const { userId, answer } = await req.json();
  return await withFileLock('players', async () => {
    const playersData = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));
    const player = playersData.players.find((p: any) => p.userId === userId);
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    const quizzes = JSON.parse(fs.readFileSync(QUIZZES_FILE, 'utf8')).quizzes;
    const quiz = quizzes.find((q: any) => q.quizId === quizId);
    if (quiz.expectedAnswer === parseInt(answer)) {
      const txHash = await sendReward(player.walletAddress);
      player.currentQuizIndex += 1;
      fs.writeFileSync(PLAYERS_FILE, JSON.stringify(playersData, null, 2));
      return NextResponse.json({ ok: true, correct: true, rewardTxHash: txHash, nextQuizIndex: player.currentQuizIndex });
    }
    return NextResponse.json({ ok: true, correct: false });
  });
}
