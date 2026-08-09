import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { DEMO_ROLE_COOKIE, isDemoRole } from '@/lib/demo-auth';
import { demoApiResponse } from '@/lib/demo-api-responses';
import { isDemoMode } from '@/lib/demo-mode';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Modo demo: APIs mockadas sem Supabase
  if (isDemoMode() && pathname.startsWith('/api/')) {
    const demoRes = await demoApiResponse(req);
    if (demoRes) return demoRes;
  }
  const demoRole = req.cookies.get(DEMO_ROLE_COOKIE)?.value;

  // Showcase: cookie demo libera acesso sem sessão real
  if (isDemoRole(demoRole)) {
    if (pathname.startsWith('/admin') && demoRole !== 'ADMIN') {
      return NextResponse.redirect(
        new URL('/conta/login?msg=faça-login-primeiro', req.url),
      );
    }
    return NextResponse.next();
  }

  // Fallback: NextAuth JWT se existir
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.role) {
    return NextResponse.redirect(
      new URL('/conta/login?msg=faça-login-primeiro', req.url),
    );
  }

  if (
    pathname.startsWith('/portal') &&
    token.role !== 'PACIENTE' &&
    token.role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/conta/login', req.url));
  }

  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/conta/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*', '/api/:path*'],
};
