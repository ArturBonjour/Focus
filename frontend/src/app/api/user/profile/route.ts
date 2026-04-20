import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001/api';

/**
 * GET /api/user/profile
 * Proxies to backend /api/users/me using the httpOnly nt_access cookie.
 */
export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('nt_access')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: res?.status ?? 500 });
  }

  const data = (await res.json()) as unknown;
  return NextResponse.json(data);
}
