import { NextResponse } from 'next/server';

export async function GET() {
  const rawEnvVars = {
    GOOGLE_CALENDAR_ID: {
      raw: process.env.GOOGLE_CALENDAR_ID,
      length: process.env.GOOGLE_CALENDAR_ID?.length || 0,
      trimmed: process.env.GOOGLE_CALENDAR_ID?.trim(),
      trimmedLength: process.env.GOOGLE_CALENDAR_ID?.trim().length || 0,
      hasQuotes: process.env.GOOGLE_CALENDAR_ID?.startsWith('"') || process.env.GOOGLE_CALENDAR_ID?.startsWith("'"),
      endsWithQuotes: process.env.GOOGLE_CALENDAR_ID?.endsWith('"') || process.env.GOOGLE_CALENDAR_ID?.endsWith("'"),
      firstChar: process.env.GOOGLE_CALENDAR_ID?.charAt(0),
      lastChar: process.env.GOOGLE_CALENDAR_ID?.charAt((process.env.GOOGLE_CALENDAR_ID?.length || 1) - 1)
    },
    GOOGLE_SERVICE_ACCOUNT_EMAIL: {
      raw: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      length: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.length || 0,
      trimmed: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim(),
      trimmedLength: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim().length || 0
    },
    GOOGLE_SERVICE_ACCOUNT_KEY: {
      rawLength: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.length || 0,
      startsWith: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.substring(0, 20),
      endsWith: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.substring(-20),
      hasNewlines: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.includes('\n'),
      hasEscapedNewlines: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.includes('\\n'),
      newlineCount: (process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.match(/\\n/g) || []).length,
      actualNewlineCount: (process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.match(/\n/g) || []).length
    },
    BOOKING_TIMEZONE: process.env.BOOKING_TIMEZONE,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json({
    message: 'Raw environment variable analysis',
    rawEnvVars,
    note: 'This shows the exact values as loaded by Node.js'
  });
}
