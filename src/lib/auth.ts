import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
const { compare } = bcrypt;
import { randomUUID } from 'crypto';
import { supabase } from "@/lib/supabase";
import jwt from 'jsonwebtoken';

export const authOptions: AuthOptions = {

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

        if (credentials?.isSignUp === 'true') {

          if (!credentials.email || !credentials.password || !credentials.name || !credentials.cpf) {

            throw new Error("Dados de registro incompletos.");

          }



          const hashedPassword = await bcrypt.hash(credentials.password, 10);



          const { data: newUser, error: createError } = await supabase

            .from('User')

            .insert([

              {

                email: credentials.email,

                password: hashedPassword,

                name: credentials.name,

                cpf: credentials.cpf,

                role: "PACIENTE",

                dataNascimento: credentials.dataNascimento,

                telefone: credentials.telefone,

                currentSessionId: randomUUID(),

              }

            ])

            .select()

            .single();



          if (createError) {

            if (createError.code === '23505' && createError.message.includes('email')) {

              throw new Error("Este e-mail já está em uso.");

            } else if (createError.code === '23505' && createError.message.includes('cpf')) {

              throw new Error("Este CPF já está em uso.");

            }

            throw new Error("Erro ao criar conta. Tente novamente. [" + createError.message + "]");

          }

          return { ...newUser, id: String(newUser.id) } as any;

        } else {

          if (!credentials?.password) {

            throw new Error("Senha não fornecida.");

          }



          let userQuery = supabase.from('User').select('*');



          if (credentials.email) {

            userQuery = userQuery.eq('email', credentials.email);

          }

          else if (credentials.cpf) {

            userQuery = userQuery.eq('cpf', credentials.cpf);

          }

          else {

            throw new Error("Email ou CPF é obrigatório.");

          }



          const { data: user, error } = await userQuery.maybeSingle();



          if (error) {

            throw new Error("Erro ao buscar usuário: " + error.message);

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



          const sessionId = randomUUID();

          await supabase

            .from('User')

            .update({ currentSessionId: sessionId })

            .eq('id', user.id);

          const token = jwt.sign({ id: user.id, role: user.role, sessionId }, process.env.NEXTAUTH_SECRET, { expiresIn: '1h' });

          return { ...user, id: String(user.id), sessionId, accessToken: token };

        }

      },

    }),

  ],

  pages: {

    signIn: "/auth/signin",

  },

  session: {

    strategy: "jwt",

    maxAge: 60 * 60, // 1 hora

  },

  callbacks: {

    async signIn({ user, account }) {

      const now = new Date();



      // Update lastLogin for the user

      await supabase

        .from('User')

        .update({ lastLogin: now.toISOString() })

        .eq('id', user.id);



      if (account?.provider === 'google') {

        const { data: existingUser } = await supabase

          .from('User')

          .select('*')

          .eq('email', user.email!)

          .maybeSingle();



        if (existingUser) {

          Object.assign(user, { ...existingUser, id: String(existingUser.id) });

        } else {

          const { data: newUser } = await supabase

            .from('User')

            .insert([{ email: user.email!, name: user.name!, role: 'PACIENTE' }])

            .select()

            .single();

          if (newUser) {

            Object.assign(user, { ...newUser, id: String(newUser.id) });

          }

        }

      }

      return true;

    },



    async jwt({ token, user, account }) {

      if (user) {

        token.id = String(user.id);

        token.role = user.role;

        token.cpf = user.cpf;

        token.telefone = user.telefone;

        if ('sessionId' in user) {

          token.sessionId = (user as any).sessionId;

        }

        if ('accessToken' in user) {

          token.accessToken = (user as any).accessToken;

        }

      }

      return token;

    },



    async session({ session, token }) {

      if (token && session.user) {

        session.user.id = token.id;

        session.user.role = token.role;

        session.user.cpf = token.cpf;

        session.user.telefone = token.telefone;

        (session.user as any).sessionId = token.sessionId;

        session.accessToken = token.accessToken as string;

      }

      return session;

    },

  },

};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
