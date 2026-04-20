import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001/api';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('nt_access')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${API_URL}/analytics/recommendations`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  }).catch(() => null);

  if (!res || !res.ok) return NextResponse.json({ error: 'Failed' }, { status: 502 });

  const data: unknown = await res.json();
  return NextResponse.json(data);
}
