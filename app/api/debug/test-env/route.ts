import { NextResponse } from 'next/server';

export async function GET() {
  // Read environment variables directly
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const timezone = process.env.BOOKING_TIMEZONE;

  return NextResponse.json({
    message: 'Direct environment variable test',
    calendarId: {
      value: calendarId,
      length: calendarId?.length || 0,
      trimmed: calendarId?.trim(),
      trimmedLength: calendarId?.trim().length || 0
    },
    email: {
      value: email,
      length: email?.length || 0
    },
    key: {
      hasValue: !!key,
      length: key?.length || 0
    },
    timezone: timezone || 'DEFAULT',
    timestamp: new Date().toISOString()
  });
}
