import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001/api';

/**
 * POST /api/auth/logout
 * Clears the nt_access cookie and calls the backend to invalidate the
 * refresh token.  No auth guard needed — best-effort backend call.
 */
export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('nt_access')?.value;

  // Best-effort: tell backend to invalidate the refresh token
  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {
      // ignore — we still clear the cookie
    });
  }

  // Always clear the access token cookie
  cookieStore.delete('nt_access');

  return NextResponse.json({ ok: true });
}
