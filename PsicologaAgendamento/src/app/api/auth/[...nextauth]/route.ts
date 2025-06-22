import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { FirestoreAdapter } from '@next-auth/firebase-adapter'
import { db } from '@/lib/firebase'
import bcrypt from 'bcryptjs'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'

export const authOptions = {
  adapter: FirestoreAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isSignUp: { label: 'Is Sign Up', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const usersRef = collection(db, 'users')
          const q = query(usersRef, where('email', '==', credentials.email))
          const querySnapshot = await getDocs(q)

          if (credentials.isSignUp === 'true') {
            // Registro de novo usuário
            if (!querySnapshot.empty) {
              throw new Error('Usuário já existe')
            }

            if (!credentials.name) {
              throw new Error('Nome é obrigatório')
            }

            const hashedPassword = await bcrypt.hash(credentials.password, 12)
            
            const newUser = {
              name: credentials.name,
              email: credentials.email,
              password: hashedPassword,
              role: 'patient',
              createdAt: new Date(),
              emailVerified: null
            }

            const docRef = await addDoc(usersRef, newUser)
            
            return {
              id: docRef.id,
              name: credentials.name,
              email: credentials.email,
              role: 'patient'
            }
          } else {
            // Login de usuário existente
            if (querySnapshot.empty) {
              throw new Error('Usuário não encontrado')
            }

            const userDoc = querySnapshot.docs[0]
            const userData = userDoc.data()

            if (!userData.password) {
              throw new Error('Usuário registrado com Google. Use login social.')
            }

            const isPasswordValid = await bcrypt.compare(credentials.password, userData.password)
            
            if (!isPasswordValid) {
              throw new Error('Senha incorreta')
            }

            return {
              id: userDoc.id,
              name: userData.name,
              email: userData.email,
              role: userData.role || 'patient'
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'patient'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

