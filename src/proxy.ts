import { NextRequest, NextResponse } from 'next/server';
import { checkSession, cookieName, cookieOptions } from '@/lib/server-session';
export async function proxy(request: NextRequest) {
  const portal = request.nextUrl.pathname.startsWith('/agent-portal') ? 'agent' : 'admin';
  const root = portal === 'agent' ? '/agent-portal' : '/ops-9xk3';
  const login = root + '/login';
  const token = request.cookies.get(cookieName(portal))?.value;
  let valid = false;
  if (token) {
    try {
      const session = await checkSession(portal, token);
      if (session.status >= 500) return new NextResponse('Authentication service unavailable', { status: 503 });
      valid = session.ok;
    } catch { return new NextResponse('Authentication service unavailable', { status: 503 }); }
  }
  const isLogin = request.nextUrl.pathname === login;
  const response = valid && isLogin ? NextResponse.redirect(new URL(root, request.url))
    : !valid && !isLogin ? NextResponse.redirect(new URL(login, request.url)) : NextResponse.next();
  if (token && !valid) response.cookies.set(cookieName(portal), '', { ...cookieOptions, maxAge: 0 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
export const config = { matcher: ['/ops-9xk3/:path*', '/agent-portal/:path*', '/studio/:path*'] };
