"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { UserRole } from "@prisma/client"

interface AuthContextType {
  user: any
  isLoading: boolean
  signOut: () => void
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 Auth Context Session:', {
      status,
      session: session ? { 
        user: session.user ? { 
          id: session.user.id, 
          email: session.user.email, 
          role: session.user.role 
        } : null 
      } : null,
      timestamp: new Date().toISOString()
    })
    setIsLoading(status === "loading")
  }, [status, session])

  const isAuthenticated = !!session?.user

  const hasRole = (role: UserRole) => {
    return session?.user?.role === role
  }

  const value = {
    user: session?.user,
    isLoading,
    signOut: () => signOut(),
    isAuthenticated,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
