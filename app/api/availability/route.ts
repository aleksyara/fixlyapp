import { NextResponse } from 'next/server';
import { freeSlotsForDate } from '@/lib/freebusy';

export async function GET(req: Request) {
  try {
    const date = new URL(req.url).searchParams.get('date');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Missing or invalid date' }, { status: 400 });
    }
    
    const slots = await freeSlotsForDate(date);
    
    // Create response with caching headers
    const response = NextResponse.json({ slots });
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
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
