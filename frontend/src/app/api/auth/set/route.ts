import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/** Access token TTL: 15 minutes */
const ACCESS_COOKIE_MAX_AGE = 15 * 60;

/**
 * POST /api/auth/set
 * Called by the login page after a successful backend auth.
 * Stores the accessToken in an httpOnly cookie so SSR pages can read it
 * without exposing it to client-side JS or putting it in the URL.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => ({}))) as {
    accessToken?: string;
  };

  if (!body.accessToken) {
    return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set('nt_access', body.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}
