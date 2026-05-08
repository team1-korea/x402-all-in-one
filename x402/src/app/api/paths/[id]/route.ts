import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
const PATHS_FILE = path.join(process.cwd(), 'runtime/paths.json');
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const pathId = params.id;
  if (!fs.existsSync(PATHS_FILE)) return NextResponse.json({ error: 'Not initialized' }, { status: 500 });
  const paths = JSON.parse(fs.readFileSync(PATHS_FILE, 'utf8')).paths;
  const pathData = paths.find((p: any) => p.pathId === pathId);
  if (!pathData) return NextResponse.json({ error: 'Path not found' }, { status: 404 });
  return NextResponse.json(pathData);
}
