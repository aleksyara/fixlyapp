import { NextResponse } from 'next/server';
import { calendarClient, getCalendarConfig } from '@/lib/google-calendar';

export async function GET() {
  try {
    const config = getCalendarConfig();
    const cal = calendarClient();
    
    // Test calendar access by trying to list events
    const response = await cal.events.list({
      calendarId: config.CALENDAR_ID,
      maxResults: 1,
      timeMin: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      calendarId: config.CALENDAR_ID,
      eventsFound: response.data.items?.length || 0,
      message: 'Calendar access successful'
    });
  } catch (error: any) {
    console.error('[test-calendar] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      status: error.status,
      details: error.response?.data || error.cause || 'No additional details',
      calendarId: process.env.GOOGLE_CALENDAR_ID
    }, { status: 500 });
  }
}
