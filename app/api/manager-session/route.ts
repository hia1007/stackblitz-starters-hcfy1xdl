import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') ?? '';
  const isManager = cookie.includes('manager=');
  return NextResponse.json({ isManager });
}
