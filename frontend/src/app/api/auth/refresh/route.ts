import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001/api';

const ACCESS_COOKIE_MAX_AGE = 15 * 60;

/**
 * POST /api/auth/refresh
 * Uses the nt_refresh httpOnly cookie (forwarded to backend) to get a new
 * access token, then updates the nt_access httpOnly cookie.
 */
export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();

  // Forward the nt_refresh cookie to the backend
  const refreshCookie = cookieStore.get('nt_refresh');
  if (!refreshCookie) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Forward the refresh cookie as-is
      Cookie: `nt_refresh=${refreshCookie.value}`,
    },
    body: JSON.stringify({}),
  }).catch(() => null);

  if (!res || !res.ok) {
    // Refresh failed — clear access cookie so user is redirected to login
    cookieStore.delete('nt_access');
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
  }

  const data = (await res.json().catch(() => ({}))) as {
    accessToken?: string;
  };

  if (!data.accessToken) {
    cookieStore.delete('nt_access');
    return NextResponse.json({ error: 'No access token in response' }, { status: 401 });
  }

  // Update the nt_access cookie with the new token
  cookieStore.set('nt_access', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  // Also return the token so client JS can update localStorage
  return NextResponse.json({ accessToken: data.accessToken });
}
