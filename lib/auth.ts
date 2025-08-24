import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          // For OAuth users (who don't have passwords), allow login with email only
          if (!user.password || user.password === "") {
            // This is an OAuth user, allow login with email only
                      return {
            id: user.id,
            email: user.email || "",
            name: user.name || "",
            role: user.role
          }
          }

          // For regular users, check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email || "",
            name: user.name || "",
            role: user.role
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user, token }) {
      console.log('Session callback - user:', user?.email, 'token:', token?.id)
      if (session.user) {
        session.user.id = user?.id || token?.id
        session.user.role = user?.role || token?.role
      }
      return session
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback - user:', user?.email, 'account:', account?.provider)
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}
