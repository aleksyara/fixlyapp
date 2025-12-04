"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth-context"
import SiteHeader from "@/components/ui/header-site"
import { Toaster } from "@/components/ui/toaster"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SiteHeader />
        {children}
        <Toaster />
      </AuthProvider>
    </SessionProvider>
  )
}
