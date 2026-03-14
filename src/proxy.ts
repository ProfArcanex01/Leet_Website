import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_TOKEN_COOKIE = 'leet_admin_token';
const AGENT_TOKEN_COOKIE = 'leet_agent_token';

function hasCookie(request: NextRequest, name: string) {
  return Boolean(request.cookies.get(name)?.value);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Enforce route-level protection before protected pages render.
  if (pathname.startsWith('/ops-9xk3') && pathname !== '/ops-9xk3/login') {
    if (!hasCookie(request, ADMIN_TOKEN_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = '/ops-9xk3/login';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/studio')) {
    if (!hasCookie(request, ADMIN_TOKEN_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = '/ops-9xk3/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/ops-9xk3/login' && hasCookie(request, ADMIN_TOKEN_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = '/ops-9xk3';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/agent-portal') && pathname !== '/agent-portal/login') {
    if (!hasCookie(request, AGENT_TOKEN_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = '/agent-portal/login';
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/agent-portal/login' && hasCookie(request, AGENT_TOKEN_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = '/agent-portal';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ops-9xk3/:path*', '/agent-portal/:path*', '/studio/:path*'],
};
