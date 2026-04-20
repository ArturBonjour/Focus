import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth proxy: if no nt_access cookie and the path is the dashboard (/),
 * let them through (demo mode is supported without auth).
 * The app supports a graceful demo fallback so we don't hard-redirect here —
 * only the login page redirects back when a token IS present.
 *
 * What we DO enforce:
 *  • /api/auth/* — always allow (these set/clear the cookie)
 *  • /login       — if already authenticated, redirect to /
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('nt_access')?.value;

  // Redirect already-authenticated users away from /login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login'],
};
