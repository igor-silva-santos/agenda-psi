import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
const { compare } = bcrypt;
import { randomUUID } from 'crypto';
import { supabase } from "@/lib/supabase";

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
            // MIGRADO PARA SUPABASE
            const { data: newUser, error: createError } = await supabase
              .from('User')
              .insert([
                {
                  email: credentials.email,
                  password: hashedPassword,
                  name: credentials.name,
                  cpf: credentials.cpf,
                  role: "PACIENTE", // Default role for new sign-ups
                  dataNascimento: credentials.dataNascimento,
                  telefone: credentials.telefone,
                  currentSessionId: sessionId,
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
            console.log("[SIGNUP] New user created:", newUser);
            return { id: String(newUser.id), email: newUser.email, name: newUser.name, role: newUser.role, sessionId };
          } catch (error) {
            console.error("[SIGNUP] Error creating new user:", error);
            throw new Error("Erro ao criar conta. Tente novamente. [" + error + "]");
          }
        } else {
          // LOGIN COM SUPABASE
          if (!credentials?.password) {
            throw new Error("Senha não fornecida.");
          }

          let user = null;

          if (credentials.email) {
            // Buscar por email - usar .maybeSingle() para evitar erro de múltiplos registros
            const { data, error } = await supabase
              .from('User')
              .select('*')
              .eq('email', credentials.email)
              .maybeSingle();
            
            if (error) {
              console.error("[LOGIN] Erro ao buscar usuário por email:", error);
              throw new Error("Erro ao buscar usuário: " + error.message);
            }
            
            if (!data) {
              throw new Error("Nenhuma conta encontrada com este email.");
            }
            
            user = data;
          } else if (credentials.cpf) {
            // Buscar por CPF - usar .maybeSingle() para evitar erro de múltiplos registros
            const { data, error } = await supabase
              .from('User')
              .select('*')
              .eq('cpf', credentials.cpf)
              .maybeSingle();
            
            if (error) {
              console.error("[LOGIN] Erro ao buscar usuário por CPF:", error);
              throw new Error("Erro ao buscar usuário: " + error.message);
            }
            
            if (!data) {
              throw new Error("Nenhuma conta encontrada com este CPF.");
            }
            
            user = data;
          } else {
            throw new Error("Email ou CPF é obrigatório.");
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

          // Gerar novo sessionId e atualizar no banco
          const sessionId = randomUUID();
          const { error: updateError } = await supabase
            .from('User')
            .update({ currentSessionId: sessionId })
            .eq('id', user.id);

          if (updateError) {
            console.error("[LOGIN] Erro ao atualizar sessionId:", updateError);
            // Não falhar o login por erro de sessionId
          }

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

      // Se for login com Google
      if (account?.provider === 'google') {
        try {
          const sessionId = randomUUID();
          
          // Verificar se o usuário já existe no Supabase
          const { data: existingUser, error: findError } = await supabase
            .from('User')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

          if (findError) {
            console.error("Erro ao buscar usuário Google:", findError);
            return false;
          }

          if (existingUser) {
            // Usuário existe, atualizar sessionId
            const { error: updateError } = await supabase
              .from('User')
              .update({ currentSessionId: sessionId })
              .eq('id', existingUser.id);

            if (updateError) {
              console.error("Erro ao atualizar sessionId do usuário Google:", updateError);
              return false;
            }

            // Atualizar dados do usuário para a sessão
            user.id = String(existingUser.id);
            user.role = existingUser.role;
            (user as any).sessionId = sessionId;
          } else {
            // Usuário não existe, criar novo
            const { data: newUser, error: createError } = await supabase
              .from('User')
              .insert([
                {
                  email: user.email!,
                  name: user.name!,
                  role: 'PACIENTE', // Default role para novos usuários Google
                  currentSessionId: sessionId,
                  // Não definir password para usuários Google
                }
              ])
              .select()
              .single();

            if (createError) {
              console.error("Erro ao criar usuário Google:", createError);
              return false;
            }

            // Atualizar dados do usuário para a sessão
            user.id = String(newUser.id);
            user.role = newUser.role;
            (user as any).sessionId = sessionId;
          }

          return true;
        } catch (error) {
          console.error("Erro no callback signIn do Google:", error);
          return false;
        }
      }

      return true; // Allow sign in for other providers
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