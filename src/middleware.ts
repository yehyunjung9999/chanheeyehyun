import { NextResponse, type NextRequest } from 'next/server';
import { readSession } from '@/lib/supabase/middleware';

// 파트 0 소유. 로그인·승인 확인 + dorms-check CSP(nonce 방식)를 모든 요청에 붙인다.
const PUBLIC_PATHS = ['/login', '/auth/callback', '/privacy', '/terms'];

function buildCsp(nonce: string) {
  const dev = process.env.NODE_ENV === 'development';
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${supabase}${dev ? ' ws:' : ''}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
  const isApi = path.startsWith('/api/');

  const { user, approved, cookiesToApply } = await readSession(request);

  const finish = (res: NextResponse) => {
    cookiesToApply.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    res.headers.set('Content-Security-Policy', csp);
    return res;
  };
  const redirectTo = (to: string) => finish(NextResponse.redirect(new URL(to, request.url)));

  if (!isPublic) {
    if (!user) {
      if (isApi) return finish(NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 }));
      return redirectTo('/login');
    }
    if (!approved && path !== '/pending') {
      if (isApi) return finish(NextResponse.json({ error: '승인된 교사만 쓸 수 있어요.' }, { status: 403 }));
      return redirectTo('/pending');
    }
  } else if (path === '/login' && user && approved) {
    return redirectTo('/dashboard');
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  return finish(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)'],
};
