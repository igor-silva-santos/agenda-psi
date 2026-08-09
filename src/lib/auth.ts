import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { demoUsers, isDemoRole, type DemoRole } from '@/lib/demo-auth';

/**
 * NextAuth em modo demonstração de portfólio.
 * Aceita qualquer credencial e retorna role conforme `demoRole` (ADMIN|PACIENTE).
 */
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        cpf: { label: 'CPF', type: 'text' },
        password: { label: 'Password', type: 'password' },
        demoRole: { label: 'Demo Role', type: 'text' },
      },
      async authorize(credentials) {
        const requested = credentials?.demoRole;
        const role: DemoRole = isDemoRole(requested) ? requested : 'PACIENTE';
        const user = demoUsers[role];

        return {
          id: user.id,
          email: credentials?.email || user.email,
          name: user.name,
          role: user.role,
          cpf: user.cpf,
          telefone: user.telefone,
          image: user.image,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: '/conta/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.role = (user as any).role;
        token.cpf = (user as any).cpf;
        token.telefone = (user as any).telefone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.cpf = token.cpf as string;
        session.user.telefone = token.telefone as string;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'agendapsi-demo-secret',
};
