import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing OAuth Flow Configuration')
    
    // Test if we can access the auth options
    const providers = authOptions.providers
    const googleProvider = providers.find(p => p.id === 'google')
    
    const testResult = {
      success: true,
      message: "OAuth Flow Test",
      hasGoogleProvider: !!googleProvider,
      providerId: googleProvider?.id || 'NOT_FOUND',
      providerName: googleProvider?.name || 'NOT_FOUND',
      timestamp: new Date().toISOString()
    }

    console.log('🔍 OAuth Flow Test Result:', testResult)

    return NextResponse.json(testResult)
  } catch (error) {
    console.error('❌ OAuth Flow Test Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
