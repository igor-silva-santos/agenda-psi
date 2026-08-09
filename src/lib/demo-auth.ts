/**
 * Auth mock para showcase de portfólio.
 * Cookie: agendapsi-demo-role = ADMIN | PACIENTE
 */

export const DEMO_ROLE_COOKIE = 'agendapsi-demo-role';
export type DemoRole = 'ADMIN' | 'PACIENTE';

export const demoUsers = {
  ADMIN: {
    id: 'demo-admin',
    name: 'Ana Ribeiro (Admin)',
    email: 'admin@agendapsi.demo',
    role: 'ADMIN' as const,
    image: null as string | null,
    cpf: '000.000.000-00',
    telefone: '(11) 90000-0000',
  },
  PACIENTE: {
    id: 'demo-paciente',
    name: 'Maria Silva',
    email: 'paciente@agendapsi.demo',
    role: 'PACIENTE' as const,
    image: null as string | null,
    cpf: '111.111.111-11',
    telefone: '(11) 98888-0000',
  },
} as const;

export function isDemoRole(value: string | undefined | null): value is DemoRole {
  return value === 'ADMIN' || value === 'PACIENTE';
}

export function getDemoUser(role: DemoRole) {
  return demoUsers[role];
}

/** Session-like object for client/server layouts */
export function buildDemoSession(role: DemoRole) {
  const user = getDemoUser(role);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      cpf: user.cpf,
      telefone: user.telefone,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function readDemoRoleFromDocument(): DemoRole | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${DEMO_ROLE_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.split('=').slice(1).join('='));
  return isDemoRole(value) ? value : null;
}

export function clearDemoRoleCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${DEMO_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
