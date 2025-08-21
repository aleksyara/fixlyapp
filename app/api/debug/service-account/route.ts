import { NextResponse } from 'next/server';
import { getCalendarConfig } from '@/lib/google-calendar';

export async function GET() {
  try {
    const config = getCalendarConfig();
    return NextResponse.json({
      serviceAccountEmail: config.email,
      calendarId: config.CALENDAR_ID,
      timezone: config.TZ,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

