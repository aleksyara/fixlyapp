import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    
    const oauthConfig = {
      googleClientId: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      timestamp: new Date().toISOString()
    }

    console.log('🔍 OAuth Configuration Test:', oauthConfig)

    return NextResponse.json({
      success: true,
      message: "OAuth Configuration Check",
      config: oauthConfig
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
