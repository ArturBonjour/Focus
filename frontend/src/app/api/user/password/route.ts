import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001/api';

/**
 * PATCH /api/user/password
 * Proxies to backend PATCH /api/users/me/password
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('nt_access')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as unknown;

  const res = await fetch(`${API_URL}/users/me/password`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!res || !res.ok) {
    const errData = await res?.json().catch(() => ({})) as { message?: string };
    const message = typeof errData.message === 'string' ? errData.message : 'Не удалось изменить пароль';
    return NextResponse.json({ error: message }, { status: res?.status ?? 500 });
  }

  const data = (await res.json()) as unknown;
  return NextResponse.json(data);
}
