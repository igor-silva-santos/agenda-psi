import { NextRequest, NextResponse } from 'next/server';
import { DEMO_ROLE_COOKIE, isDemoRole, type DemoRole } from '@/lib/demo-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const role = (body?.role as string) || '';

    if (!isDemoRole(role)) {
      return NextResponse.json(
        { error: 'role deve ser ADMIN ou PACIENTE' },
        { status: 400 },
      );
    }

    const redirectTo = role === 'ADMIN' ? '/admin' : '/portal/paciente';
    const response = NextResponse.json({ ok: true, role, redirectTo });

    response.cookies.set(DEMO_ROLE_COOKIE, role as DemoRole, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Falha no login demo' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_ROLE_COOKIE, '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}
