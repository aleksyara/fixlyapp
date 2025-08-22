import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calendarClient, getCalendarConfig } from '@/lib/google-calendar';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Get all bookings for this email from database
    const dbBookings = await prisma.booking.findMany({
      where: {
        customerEmail: email
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check which ones still exist in Google Calendar
    const cal = calendarClient();
    const { CALENDAR_ID } = getCalendarConfig();
    
    const bookingStatuses = [];

    for (const booking of dbBookings) {
      let calendarExists = false;
      let error = null;

      try {
        await cal.events.get({
          calendarId: CALENDAR_ID as string,
          eventId: booking.googleEventId
        });
        calendarExists = true;
      } catch (err: any) {
        error = err.status || err.message;
      }

      bookingStatuses.push({
        id: booking.id,
        googleEventId: booking.googleEventId,
        date: booking.date,
        startTime: booking.startTime,
        status: booking.status,
        existsInCalendar: calendarExists,
        calendarError: error
      });
    }

    const confirmedInDB = dbBookings.filter(b => b.status === 'CONFIRMED').length;
    const confirmedInCalendar = bookingStatuses.filter(b => b.status === 'CONFIRMED' && b.existsInCalendar).length;

    return NextResponse.json({
      email,
      totalBookingsInDB: dbBookings.length,
      confirmedInDB,
      confirmedInCalendar,
      bookings: bookingStatuses
    });

  } catch (error: any) {
    console.error('Debug bookings error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
