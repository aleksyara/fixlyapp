import { NextResponse } from 'next/server';
import { getCalendarConfig } from '@/lib/google-calendar';

export async function GET() {
  try {
    console.log('[debug] Testing private key format...');
    
    // Test the configuration function
    const config = getCalendarConfig();
    
    // Test if we can create a JWT without making API calls
    const { google } = require('googleapis');
    const jwt = new google.auth.JWT({
      email: config.email,
      key: config.key,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    
    // Try to create credentials (this tests the key format without making API calls)
    const credentials = await jwt.authorize();
    
    return NextResponse.json({
      success: true,
      message: 'Private key format is valid',
      email: config.email,
      calendarId: config.CALENDAR_ID,
      timezone: config.TZ,
      keyFormat: {
        hasBegin: config.key.includes('-----BEGIN PRIVATE KEY-----'),
        hasEnd: config.key.includes('-----END PRIVATE KEY-----'),
        hasNewlines: config.key.includes('\n'),
        length: config.key.length
      },
      credentials: {
        access_token: credentials.access_token ? 'PRESENT' : 'MISSING',
        token_type: credentials.token_type,
        expiry_date: credentials.expiry_date
      }
    });
    
  } catch (error) {
    console.error('[debug] Key format test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
