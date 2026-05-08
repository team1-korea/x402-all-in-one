import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
const PRODUCTS_FILE = path.join(process.cwd(), 'runtime/products.json');
const PLAYERS_FILE = path.join(process.cwd(), 'runtime/players.json');
export async function GET(req: NextRequest) {
  if (!fs.existsSync(PRODUCTS_FILE) || !fs.existsSync(PLAYERS_FILE)) {
    return NextResponse.json({ error: 'System not initialized' }, { status: 500 });
  }
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  const players = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8')).players;

  const totalWinners = players.filter((p: any) => p.status === 'finished').length;
  const soldOutProducts = products.products.filter((p: any) => p.stock === 0).length;

  return NextResponse.json({
    eventId: process.env.EVENT_ID || products.eventId,
    timestamp: new Date().toISOString(),
    totalWinners,
    soldOutProducts,
    isFullySoldOut: soldOutProducts === products.products.length,
    productStatus: products.products.map((p: any) => ({ name: p.name, stock: p.stock, status: p.status }))
  });
}
