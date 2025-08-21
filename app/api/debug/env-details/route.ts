import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    GOOGLE_CALENDAR_ID: {
      value: process.env.GOOGLE_CALENDAR_ID,
      length: process.env.GOOGLE_CALENDAR_ID?.length || 0,
      first10: process.env.GOOGLE_CALENDAR_ID?.substring(0, 10) || 'undefined',
      last10: process.env.GOOGLE_CALENDAR_ID?.substring(-10) || 'undefined'
    },
    GOOGLE_SERVICE_ACCOUNT_EMAIL: {
      value: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      length: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.length || 0
    },
    GOOGLE_SERVICE_ACCOUNT_KEY: {
      hasValue: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      length: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.length || 0,
      startsWith: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.substring(0, 20) || 'undefined'
    },
    BOOKING_TIMEZONE: process.env.BOOKING_TIMEZONE || 'DEFAULT (America/Los_Angeles)',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json({
    message: 'Detailed environment variables',
    envVars,
    fileCheck: 'Check if .env.local exists and has correct values'
  });
}
