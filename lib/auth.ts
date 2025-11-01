import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
        mode: { label: 'Mode', type: 'text' } // 'password' | 'otp'
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null

        // OTP mode login
        if (credentials.mode === 'otp') {
          if (!user.emailVerifiedAt) return null
          if (!credentials.otp || !user.loginOtpHash || !user.loginOtpExpiresAt) return null
          if (new Date(user.loginOtpExpiresAt).getTime() < Date.now()) return null

          const ok = await bcrypt.compare(credentials.otp, user.loginOtpHash)
          if (!ok) return null

          await prisma.user.update({
            where: { id: user.id },
            data: { loginOtpHash: null, loginOtpExpiresAt: null, otpAttemptCount: 0 }
          })

          return { id: user.id, email: user.email, name: user.name, role: user.role }
        }

        // Default: password login
        if (!credentials.password) return null
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'hars-jewellery-secret-key-2024-production-ready',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}
