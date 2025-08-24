"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserRole } from "@prisma/client"
import ClientDashboard from "@/components/dashboard/ClientDashboard"
import TechnicianDashboard from "@/components/dashboard/TechnicianDashboard"
import AdminDashboard from "@/components/dashboard/AdminDashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 Dashboard Auth State:', {
      isAuthenticated,
      isLoading,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      timestamp: new Date().toISOString()
    })

    if (!isLoading && !isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to signin')
      router.push("/auth/signin")
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || user?.email}</p>
      </div>

      {hasRole(UserRole.CLIENT) && <ClientDashboard />}
      {hasRole(UserRole.TECHNICIAN) && <TechnicianDashboard />}
      {hasRole(UserRole.ADMIN) && <AdminDashboard />}
    </div>
  )
}
