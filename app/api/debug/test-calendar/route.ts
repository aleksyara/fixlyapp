import { NextResponse } from 'next/server';
import { calendarClient, getCalendarConfig } from '@/lib/google-calendar';

export async function GET() {
  try {
    console.log('[debug] Testing Google Calendar connection...');
    
    // Test 1: Check configuration
    const config = getCalendarConfig();
    console.log('[debug] Config loaded successfully:', {
      calendarId: config.CALENDAR_ID,
      timezone: config.TZ,
      hasEmail: !!config.email,
      hasKey: !!config.key
    });
    
    // Test 2: Test calendar client creation
    const cal = calendarClient();
    console.log('[debug] Calendar client created successfully');
    
    // Test 3: Test a simple API call
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    
    console.log('[debug] Testing freebusy query...');
    const res = await cal.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: config.CALENDAR_ID }],
      },
    });
    
    console.log('[debug] Freebusy query successful');
    
    return NextResponse.json({
      success: true,
      message: 'Google Calendar connection test successful',
      calendarId: config.CALENDAR_ID,
      timezone: config.TZ,
      testDate: today.toISOString(),
      calendarsInResponse: Object.keys(res.data.calendars || {}),
      busyPeriods: res.data.calendars?.[config.CALENDAR_ID]?.busy?.length || 0
    });
    
  } catch (error) {
    console.error('[debug] Google Calendar test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
