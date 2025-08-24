"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth-context"
import SiteHeader from "@/components/ui/header-site"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SiteHeader />
        {children}
      </AuthProvider>
    </SessionProvider>
  )
}
