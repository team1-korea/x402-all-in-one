import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { withFileLock } from '../../../../../core/lock';
const PLAYERS_FILE = path.join(process.cwd(), 'runtime/players.json');
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const pathId = params.id;
  const adminKey = req.headers.get('x-admin-key');

  if (process.env.ADMIN_API_KEY && adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return await withFileLock('players', async () => {
    const playersData = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));
    let count = 0;
    playersData.players.forEach((p: any) => {
      if (p.selectedPathId === pathId && p.status === 'in_progress') {
        p.status = 'reset'; p.selectedProductId = null; p.selectedPathId = null; count++;
      }
    });
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify(playersData, null, 2));
    return NextResponse.json({ ok: true, resetCount: count });
  });
}
