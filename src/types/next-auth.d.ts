import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: string;
      cpf: string | null;
      telefone: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: number;
    role: string;
    cpf: string | null;
    telefone: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    id: string;
    role: string;
    cpf: string | null;
    telefone: string | null;
  }
}