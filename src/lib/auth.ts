import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs';
const { compare } = bcrypt;
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { randomUUID } from 'crypto';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", required: false },
        cpf: { label: "CPF", type: "text", required: false },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text", required: false },
        isSignUp: { label: "Is Sign Up", type: "text", required: false },
        dataNascimento: { label: "Data de Nascimento", type: "text", required: false },
        telefone: { label: "Telefone", type: "text", required: false },
      },
      async authorize(credentials) {
        console.log("Credentials received:", credentials);

        if (credentials?.isSignUp === 'true') {
          // Log detalhado dos campos recebidos
          console.log("[SIGNUP] Campos recebidos:", JSON.stringify(credentials, null, 2));
          // Logic for new user registration
          if (!credentials.email || !credentials.password || !credentials.name || !credentials.cpf) {
            console.error("[SIGNUP] Dados de registro incompletos:", credentials);
            throw new Error("Dados de registro incompletos.");
          }

          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          console.log("[SIGNUP] Hashed password:", hashedPassword);

          try {
            const sessionId = randomUUID();
            const newUser = await prisma.user.create({
              data: {
                email: credentials.email,
                password: hashedPassword,
                name: credentials.name,
                cpf: credentials.cpf,
                role: "PACIENTE", // Default role for new sign-ups
                dataNascimento: credentials.dataNascimento,
                telefone: credentials.telefone,
                currentSessionId: sessionId,
              } as any,
            });
            console.log("[SIGNUP] New user created:", newUser);
            return { id: String(newUser.id), email: newUser.email, name: newUser.name, role: newUser.role, sessionId };
          } catch (error) {
            console.error("[SIGNUP] Error creating new user:", error);
            if (error instanceof PrismaClientKnownRequestError) {
              if (error.code === 'P2002') { // Unique constraint violation
                if (Array.isArray(error.meta?.target) && error.meta?.target.includes('email')) {
                  throw new Error("Este e-mail já está em uso.");
                } else if (Array.isArray(error.meta?.target) && error.meta?.target.includes('cpf')) {
                  throw new Error("Este CPF já está em uso.");
                }
              }
            }
            throw new Error("Erro ao criar conta. Tente novamente. [" + error + "]");
          }
        } else {
          // Existing login logic
          if (!credentials?.password) {
            throw new Error("Senha não fornecida.");
          }

          let user = null;

          if (credentials.email) {
            user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });
          } else if (credentials.cpf) {
            user = await prisma.user.findUnique({
              where: { cpf: credentials.cpf },
            });
          }

          if (!user) {
            throw new Error("Nenhuma conta encontrada com os dados fornecidos.");
          }

          if (!user.password) {
            throw new Error("Esta conta foi criada usando um provedor social. Por favor, use o login social.");
          }

          const isValidPassword = await compare(credentials.password, user.password);

          if (!isValidPassword) {
            throw new Error("Credenciais inválidas.");
          }

          // Sessão única: gerar novo sessionId e salvar no usuário
          const sessionId = randomUUID();
          await prisma.user.update({ where: { id: user.id }, data: { currentSessionId: sessionId } as any });
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
            sessionId: sessionId,
          };
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    // error: '/auth/error', // Opcional: página de erro personalizada
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hora em segundos
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("signIn callback - user:", user);
      console.log("signIn callback - account:", account);
      console.log("signIn callback - profile:", profile);
      return true; // Allow sign in
    },
    async jwt({ token, user }) {
      console.log("jwt callback - token (before):", token);
      console.log("jwt callback - user:", user);
      if (user) {
        token.id = String(user.id);
        token.role = user.role;
        // user pode ser do tipo AdapterUser, então propagamos sessionId se existir
        if ('sessionId' in user) {
          token.sessionId = (user as any).sessionId;
        }
      }
      console.log("jwt callback - token (after):", token);
      return token;
    },
    async session({ session, token }) {
      console.log("session callback - session (before):", session);
      console.log("session callback - token:", token);
      if (token && session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as string;
        (session.user as any).sessionId = token.sessionId as string;
      }
      console.log("session callback - session (after):", session);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };