import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, checkSession, cookieName, cookieOptions, sameOrigin, type Portal } from '@/lib/server-session';
const loginPaths: Record<string, string> = {
  'admin/login': '/accounts/admin/login/', 'admin/verify': '/accounts/admin/login/verify-otp/',
  'agent/login': '/accounts/auth/init/', 'agent/verify': '/accounts/auth/verify-login/',
};
type Context = { params: Promise<{ portal: string; path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  const { portal: rawPortal, path } = await context.params;
  if (rawPortal !== 'admin' && rawPortal !== 'agent') return new NextResponse(null, { status: 404 });
  const portal = rawPortal as Portal;
  const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
  if (!['GET', 'HEAD'].includes(request.method) && !sameOrigin(request)) return json({ error: 'Invalid origin' }, 403);
  const action = path.join('/');
  if (action === 'logout' && request.method === 'POST') {
    const response = json({ ok: true });
    response.cookies.set(cookieName(portal), '', { ...cookieOptions, maxAge: 0 });
    response.cookies.set(`leet_${portal}_token`, '', { ...cookieOptions, maxAge: 0 });
    return response;
  }
  try {
    const loginPath = loginPaths[`${portal}/${action}`];
    if (loginPath && request.method === 'POST') {
      const upstream = await fetch(backendUrl(loginPath), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: await request.text(),
        cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
      });
      const payload = await upstream.json();
      const access = payload.access;
      delete payload.access;
      delete payload.refresh;
      if (!upstream.ok || !access) return json(payload, upstream.status);
      const session = await checkSession(portal, access);
      if (!session.ok) return json({ error: 'Portal access denied' }, 403);
      const response = json({ ...payload, authenticated: true });
      response.cookies.set(cookieName(portal), access, cookieOptions);
      response.cookies.set(`leet_${portal}_token`, '', { ...cookieOptions, maxAge: 0 });
      return response;
    }
    const token = request.cookies.get(cookieName(portal))?.value;
    if (!token) return json({ error: 'Sign in required' }, 401);
    if (action === 'session' && request.method === 'GET') {
      const session = await checkSession(portal, token);
      return json(await session.json(), session.status);
    }
    // Restrict forwarding to portal namespaces, excluding token-issuing endpoints.
    const apiPath = '/' + path.slice(1).join('/') + '/';
    const allowed = portal === 'agent' ? /^\/agents\/me\//.test(apiPath)
      : /^\/(accounts|agents|campaigns|invites|rides|payments|notifications|waitlist|fares)\/admin\//.test(apiPath);
    if (path[0] !== 'proxy' || !allowed || /[%\\\\]|\.\./.test(apiPath) || /\/accounts\/admin\/login\//.test(apiPath)) return json({ error: 'Unsupported endpoint' }, 404);
    const upstream = await fetch(backendUrl(apiPath) + request.nextUrl.search, {
      method: request.method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': request.headers.get('content-type') || 'application/json' },
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
    });
    const response = new NextResponse(upstream.body, { status: upstream.status, headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store',
    } });
    if (upstream.status === 401) response.cookies.set(cookieName(portal), '', { ...cookieOptions, maxAge: 0 });
    return response;
  } catch { return json({ error: 'Authentication service unavailable' }, 502); }
}
export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE };
