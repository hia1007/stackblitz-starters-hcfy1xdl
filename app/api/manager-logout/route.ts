import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear the manager cookie by setting it empty with maxAge 0
  res.cookies.set('manager', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
