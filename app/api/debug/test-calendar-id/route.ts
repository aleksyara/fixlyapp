import { NextResponse } from 'next/server';
import { calendarClient, getCalendarConfig } from '@/lib/google-calendar';

export async function GET() {
  try {
    const config = getCalendarConfig();
    const cal = calendarClient();
    
    // Test with the current calendar ID
    const currentCalendarId = config.CALENDAR_ID;
    
    // Try to get calendar details to see if it's accessible
    try {
      const calendarDetails = await cal.calendars.get({
        calendarId: currentCalendarId
      });
      
      return NextResponse.json({
        success: true,
        calendarId: currentCalendarId,
        calendarSummary: calendarDetails.data.summary,
        calendarDescription: calendarDetails.data.description,
        primary: calendarDetails.data.primary,
        message: 'Calendar is accessible'
      });
      
    } catch (calendarError: any) {
      console.error('[debug] Calendar access error:', calendarError);
      
      return NextResponse.json({
        success: false,
        calendarId: currentCalendarId,
        error: calendarError.message,
        code: calendarError.code,
        status: calendarError.status,
        message: 'Calendar access failed - this might be a permissions issue'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[debug] Test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
