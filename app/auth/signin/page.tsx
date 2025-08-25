"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState("")
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  useEffect(() => {
    console.log('🔍 SignIn Page Auth State:', {
      isAuthenticated,
      isLoading,
      timestamp: new Date().toISOString()
    })

    if (isAuthenticated) {
      console.log('✅ User authenticated, redirecting to dashboard')
      router.push("/dashboard")
    }
  }, [isAuthenticated, router, isLoading])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningIn(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        console.log('✅ Sign in successful')
        router.push("/dashboard")
      }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      setError("An error occurred during sign in")
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResetting(true)
    setResetMessage("")

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      })

      if (response.ok) {
        setResetMessage("Fixly will send a link to reset your password if you are already registered on our website.")
        setResetEmail("")
      } else {
        setResetMessage("Fixly will send a link to reset your password if you are already registered on our website.")
        setResetEmail("")
      }
    } catch (error) {
      setResetMessage("Fixly will send a link to reset your password if you are already registered on our website.")
      setResetEmail("")
    } finally {
      setIsResetting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to FixlyAppliance</CardTitle>
          <CardDescription>
            Sign in to access your account and manage your appointments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showResetForm ? (
            <>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full"
                  size="lg"
                  disabled={isSigningIn}
                >
                  {isSigningIn ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowResetForm(true)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Forgot your password?
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up here
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                {resetMessage && (
                  <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded">
                    {resetMessage}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full"
                  size="lg"
                  disabled={isResetting}
                >
                  {isResetting ? "Sending..." : "Reset Password"}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setShowResetForm(false)
                    setResetMessage("")
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Back to Sign In
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
