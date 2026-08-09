import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import {
  DEMO_ROLE_COOKIE,
  buildDemoSession,
  isDemoRole,
  type DemoRole,
} from '@/lib/demo-auth';
import { isDemoMode } from '@/lib/demo-mode';

export type ApiActor = {
  id: string;
  name: string;
  email: string;
  role: string;
  cpf?: string;
  telefone?: string;
};

export async function getApiActorFromCookies(): Promise<ApiActor | null> {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get(DEMO_ROLE_COOKIE)?.value;
  if (isDemoRole(demoRole)) {
    const session = buildDemoSession(demoRole);
    return session.user as ApiActor;
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.id && session.user.role) {
    return session.user as ApiActor;
  }
  return null;
}

export async function getApiActorFromRequest(
  request: Request,
): Promise<ApiActor | null> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${DEMO_ROLE_COOKIE}=`));
  if (match) {
    const value = decodeURIComponent(match.split('=').slice(1).join('='));
    if (isDemoRole(value)) {
      const session = buildDemoSession(value as DemoRole);
      return session.user as ApiActor;
    }
  }

  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET || 'agendapsi-demo-secret',
  });
  if (token?.id && token.role) {
    return {
      id: String(token.id),
      name: String(token.name ?? ''),
      email: String(token.email ?? ''),
      role: String(token.role),
      cpf: token.cpf as string | undefined,
      telefone: token.telefone as string | undefined,
    };
  }
  return null;
}

export function isAdmin(actor: ApiActor | null): boolean {
  return actor?.role === 'ADMIN';
}

export function isPatientOrAdmin(actor: ApiActor | null): boolean {
  return actor?.role === 'PACIENTE' || actor?.role === 'ADMIN';
}

export { isDemoMode };
