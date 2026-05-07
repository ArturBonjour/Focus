import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001/api';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('nt_access')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const search = req.nextUrl.searchParams.get('search') ?? '';
  const url = search ? `${API_URL}/notes?search=${encodeURIComponent(search)}` : `${API_URL}/notes`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) return NextResponse.json({ error: 'Failed' }, { status: 502 });
  const data: unknown = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('nt_access')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: unknown = await req.json();
  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!res || !res.ok) return NextResponse.json({ error: 'Failed' }, { status: 502 });
  const data: unknown = await res.json();
  return NextResponse.json(data, { status: 201 });
}
