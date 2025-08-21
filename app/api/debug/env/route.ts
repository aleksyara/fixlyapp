import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID ? 'SET' : 'NOT SET',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'SET' : 'NOT SET',
    GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'SET' : 'NOT SET',
    BOOKING_TIMEZONE: process.env.BOOKING_TIMEZONE || 'DEFAULT (America/Los_Angeles)',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    message: 'Environment variables status',
    envVars,
    timestamp: new Date().toISOString(),
  });
}

