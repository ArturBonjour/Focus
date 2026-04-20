import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001/api';

/**
 * GET /api/tasks/upcoming?days=7
 * Proxies to backend GET /api/tasks/upcoming using the httpOnly nt_access cookie.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('nt_access')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days = req.nextUrl.searchParams.get('days') ?? '7';
  const res = await fetch(`${API_URL}/tasks/upcoming?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch upcoming tasks' },
      { status: res?.status ?? 500 },
    );
  }

  const data = (await res.json()) as unknown;
  return NextResponse.json(data);
}
