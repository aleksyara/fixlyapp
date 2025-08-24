import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  console.log('🔍 Session Test Endpoint Called:', {
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  })

  try {
    const session = await getServerSession(authOptions)
    
    console.log('🔍 Session Test Result:', {
      session: session,
      isAuthenticated: !!session,
      user: session?.user || null,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      session: session,
      isAuthenticated: !!session,
      user: session?.user || null,
      message: session ? "User is authenticated" : "No active session",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Session Test Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
