import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calendarClient, getCalendarConfig } from '@/lib/google-calendar';

export async function POST() {
  try {
    // Get all confirmed bookings from database
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED'
      }
    });

    const cal = calendarClient();
    const { CALENDAR_ID } = getCalendarConfig();
    
    let syncedCount = 0;
    let cancelledCount = 0;
    const errors = [];

    console.log(`Found ${confirmedBookings.length} confirmed bookings in database`);

    for (const booking of confirmedBookings) {
      try {
        // Check if the event still exists in Google Calendar
        await cal.events.get({
          calendarId: CALENDAR_ID as string,
          eventId: booking.googleEventId
        });
        syncedCount++;
      } catch (error: any) {
        // If event doesn't exist (404), mark booking as cancelled in database
        if (error?.status === 404) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'CANCELED' }
          });
          cancelledCount++;
          console.log(`Cancelled booking ${booking.id} - event ${booking.googleEventId} not found in calendar`);
        } else {
          errors.push({
            bookingId: booking.id,
            eventId: booking.googleEventId,
            error: error.message
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database sync completed',
      stats: {
        totalBookings: confirmedBookings.length,
        stillActive: syncedCount,
        cancelled: cancelledCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Sync bookings error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
