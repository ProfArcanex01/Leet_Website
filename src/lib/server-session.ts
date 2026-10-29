import { NextRequest } from 'next/server';
export type Portal = 'admin' | 'agent';
export const cookieName = (portal: Portal) => `leet_${portal}_session`;
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: 43200 };
export function backendUrl(path: string) {
  const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error('API_URL is required');
  return base.replace(/\/$/, '') + path;
}
export async function checkSession(portal: Portal, token: string) {
  return fetch(backendUrl(portal === 'admin' ? '/accounts/admin/session/' : '/agents/me/dashboard/'), {
    headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
    redirect: 'error', signal: AbortSignal.timeout(10000),
  });
}
export function sameOrigin(request: NextRequest) {
  return request.headers.get('origin') === request.nextUrl.origin;
}
