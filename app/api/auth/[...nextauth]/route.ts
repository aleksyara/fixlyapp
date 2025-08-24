import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

// Add logging middleware
const logHandler = async (req: Request, context: any) => {
  const url = new URL(req.url)
  console.log('🔍 NextAuth Request:', {
    method: req.method,
    pathname: url.pathname,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    timestamp: new Date().toISOString()
  })

  try {
    const response = await handler(req, context)
    console.log('✅ NextAuth Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString()
    })
    return response
  } catch (error) {
    console.error('❌ NextAuth Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}

export { logHandler as GET, logHandler as POST }
