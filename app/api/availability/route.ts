import { NextResponse } from 'next/server';
import { freeSlotsForDate, clearAvailabilityCacheForDate } from '@/lib/freebusy';
import { getCalendarConfig } from '@/lib/google-calendar';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const refresh = url.searchParams.get('refresh') === 'true';
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Missing or invalid date' }, { status: 400 });
    }
    
    console.log(`[availability] Fetching slots for date: ${date}${refresh ? ' (forced refresh)' : ''}`);
    
    // Clear cache if refresh is requested
    if (refresh) {
      clearAvailabilityCacheForDate(date);
    }
    
    // Test Google Calendar configuration first
    try {
      const { CALENDAR_ID } = getCalendarConfig();
      console.log(`[availability] Calendar ID: ${CALENDAR_ID}`);
    } catch (configError) {
      console.error('[availability] Config error:', configError);
      return NextResponse.json({ 
        error: 'Google Calendar configuration error',
        details: configError instanceof Error ? configError.message : 'Unknown config error'
      }, { status: 500 });
    }
    
    const slots = await freeSlotsForDate(date);
    console.log(`[availability] Found ${slots.length} available slots for ${date}`);
    
    // Create response with shorter cache headers for more real-time data
    const response = NextResponse.json({ slots });
    
    // Add cache headers for better performance (reduced cache time)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    response.headers.set('Vary', 'Accept');
    
    return response;
  } catch (error) {
    console.error('Availability API error:', error);
    
    // Check if it's a Google Calendar authentication error
    if (error instanceof Error && error.message.includes('Missing Google env vars')) {
      return NextResponse.json({ 
        error: 'Google Calendar configuration error. Please check environment variables.',
        details: 'Missing GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, or GOOGLE_SERVICE_ACCOUNT_KEY'
      }, { status: 500 });
    }
    
    // Check if it's a Google API error
    if (error instanceof Error && error.message.includes('Google')) {
      return NextResponse.json({ 
        error: 'Google Calendar API error',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
