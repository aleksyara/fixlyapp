import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '$2a$12$example-hash-here'
    
    if (username !== adminUsername) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const isValidPassword = await bcrypt.compare(password, adminPasswordHash)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}