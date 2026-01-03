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

                // Lógica de SignUp

                if (!credentials.email || !credentials.password || !credentials.name || !credentials.cpf) {

                  throw new Error("Dados de registro incompletos.");

                }

      

                // INÍCIO DA CORREÇÃO: Verificar se o usuário já existe na tabela pública

                const { data: existingUser, error: existingUserError } = await supabase

                  .from('User')

                  .select('id')

                  .eq('email', credentials.email)

                  .maybeSingle();

      

                if (existingUserError) {

                  console.error("Erro ao verificar usuário existente:", existingUserError);

                  throw new Error("Erro no servidor. Tente novamente mais tarde.");

                }

      

                          if (existingUser) {

      

                            throw new Error("EMAIL_ALREADY_IN_USE");

      

                          }

      

                          // FIM DA CORREÇÃO

      

                

      

                          const { data, error: signUpError } = await supabase.auth.signUp({

      

                            email: credentials.email,

      

                            password: credentials.password,

      

                            options: {

      

                              data: {

      

                                name: credentials.name,

      

                                cpf: credentials.cpf,

      

                                role: "PACIENTE",

      

                                dataNascimento: credentials.dataNascimento,

      

                                telefone: credentials.telefone,

      

                              },

      

                            },

      

                          });

      

                

      

                          if (signUpError) {

      

                            // Tratar erro de usuário já existente no Supabase Auth também

      

                            if (signUpError.message.includes('User already registered')) {

      

                                 throw new Error("EMAIL_ALREADY_IN_USE");

      

                            }

                  console.error("Erro ao criar usuário no Supabase Auth:", signUpError);

                  throw new Error("Erro ao criar conta. Tente novamente. [" + signUpError.message + "]");

                }

      

                if (!data.user) {

                  throw new Error("Não foi possível criar o usuário. A resposta não contém um usuário.");

                }

      

                // Inserir usuário na tabela pública 'User'

                const { data: newUser, error: publicUserError } = await supabase

                  .from('User')

                  .insert([

                    {

                      id: data.user.id,

                      email: data.user.email!,

                      name: credentials.name,

                      cpf: credentials.cpf,

                      role: 'PACIENTE',

                      telefone: credentials.telefone,

                      dataNascimento: new Date(credentials.dataNascimento!).toISOString(),

                    },

                  ])

                  .select()

                  .single();

      

                                    if (publicUserError) {

      

                                      console.error("Erro ao criar usuário na tabela pública 'User':", publicUserError);

      

                                      await supabase.auth.admin.deleteUser(data.user.id);

      

                                      throw new Error("Erro ao salvar dados do usuário. Tente novamente. [" + publicUserError.message + "]");

      

                                    }

      

                          

      

                                    return {

      

                                      id: newUser.id,

      

                                      email: newUser.email,

      

                                      name: newUser.name,

      

                                      role: newUser.role,

      

                                      cpf: newUser.cpf,

      

                                      telefone: newUser.telefone,

      

                                    } as any;

      

                                  } else {

                  // Lógica de SignIn

                  if (!credentials?.password || (!credentials.email && !credentials.cpf)) {

                    throw new Error("Email/CPF e senha são obrigatórios.");

                  }

        

                  // Autenticar com o Supabase

                  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({

                    email: credentials.email!, // Supabase Auth usa email para login

                    password: credentials.password,

                  });

        

                            if (signInError) {

        

                              if (signInError.message === 'Email not confirmed') {

        

                                throw new Error('EMAIL_NOT_CONFIRMED');

        

                              }

        

                              console.error("Erro no signIn do Supabase:", signInError);

        

                              throw new Error(signInError.message || "Credenciais inválidas.");

        

                            }

        

                  if (!signInData.user) {

                    throw new Error("Usuário não encontrado ou credenciais inválidas.");

                  }

        

                  // Buscar o perfil do usuário na nossa tabela pública 'User'

                  const { data: userProfile, error: profileError } = await supabase

                    .from('User')

                    .select('*')

                    .eq('id', signInData.user.id)

                    .single();

        

                  if (profileError || !userProfile) {

                    console.error("Erro ao buscar perfil do usuário:", profileError);

                    throw new Error("Não foi possível carregar os dados do usuário.");

                  }

        

                  return { ...userProfile, id: String(userProfile.id) };

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
        const { data: user, error } = await supabase
          .from('User')
          .select('*')
          .eq('id', token.id)
          .single();

        if (user && !error) {
          session.user.id = user.id;
          session.user.name = user.name;
          session.user.email = user.email;
          session.user.image = user.image;
          session.user.role = user.role;
          session.user.cpf = user.cpf;
          session.user.telefone = user.telefone;
          (session.user as any).sessionId = token.sessionId;
          session.accessToken = token.accessToken as string;
        }
      }
      return session;
    },

  },

};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
