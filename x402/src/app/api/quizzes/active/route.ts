import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
const PLAYERS_FILE = path.join(process.cwd(), 'runtime/players.json');
const QUIZZES_FILE = path.join(process.cwd(), 'templates/quizzes.json');
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  if (!fs.existsSync(PLAYERS_FILE)) return NextResponse.json({ error: 'Not initialized' }, { status: 500 });
  const players = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8')).players;
  const player = players.find((p: any) => p.userId === userId);
  if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  const quizzes = JSON.parse(fs.readFileSync(QUIZZES_FILE, 'utf8')).quizzes;
  const currentQuiz = quizzes.find((q: any) => q.pathId === player.selectedPathId && q.order === player.currentQuizIndex);
  if (!currentQuiz) return NextResponse.json({ error: 'Finished or Sold Out' });
  return NextResponse.json({ quizId: currentQuiz.quizId, order: currentQuiz.order, next: `/api/quizzes/${currentQuiz.quizId}` });
}
