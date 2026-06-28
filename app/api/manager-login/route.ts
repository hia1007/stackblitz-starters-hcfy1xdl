import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body?.code ?? '');
    const secret = process.env.MANAGER_CODE;

    if (!secret) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    if (code === secret) {
      const res = NextResponse.json({ ok: true });
      // Set a short-lived httpOnly cookie to indicate manager session
      res.cookies.set('manager', '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
      return res;
    }

    return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
