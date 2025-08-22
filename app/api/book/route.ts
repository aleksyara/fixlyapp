// app/api/book/route.ts
import { NextResponse } from 'next/server';
import { calendarClient, getCalendarConfig } from '@/lib/google-calendar';
import { slotBoundsUTC } from '@/lib/availability';
import { prisma } from '@/lib/prisma';
import { sendAppointmentConfirmation } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.appointmentISO) {
      return NextResponse.json({ error: 'Missing appointmentISO' }, { status: 400 });
    }
    
    if (!body.customerEmail) {
      return NextResponse.json({ error: 'Missing customerEmail' }, { status: 400 });
    }
    
    if (!body.serviceType || !body.applianceType || !body.brand || !body.serviceAddress || !body.zipCode) {
      return NextResponse.json({ error: 'Missing required service information' }, { status: 400 });
    }

    // Check if customer already has 3 or more active bookings
    // First, get all their confirmed bookings
    const existingBookings = await prisma.booking.findMany({
      where: {
        customerEmail: body.customerEmail,
        status: 'CONFIRMED'
      }
    });

    // Verify these bookings still exist in Google Calendar
    const cal = calendarClient();
    const { CALENDAR_ID } = getCalendarConfig();
    
    let activeBookingsCount = 0;
    const bookingsToCancel = [];

    for (const booking of existingBookings) {
      try {
        // Check if the event still exists in Google Calendar
        await cal.events.get({
          calendarId: CALENDAR_ID as string,
          eventId: booking.googleEventId
        });
        activeBookingsCount++;
      } catch (error: any) {
        // If event doesn't exist (404), mark booking as cancelled in database
        if (error?.status === 404) {
          bookingsToCancel.push(booking.id);
        } else {
          // For other errors, assume the booking is still active
          activeBookingsCount++;
        }
      }
    }

    // Clean up cancelled bookings in database
    if (bookingsToCancel.length > 0) {
      await prisma.booking.updateMany({
        where: {
          id: { in: bookingsToCancel }
        },
        data: {
          status: 'CANCELED'
        }
      });
    }

    if (activeBookingsCount >= 3) {
      return NextResponse.json({ 
        error: 'Maximum booking limit reached. You can only have 3 active appointments at a time. Please cancel an existing appointment before booking a new one.' 
      }, { status: 400 });
    }

    const dt = new Date(body.appointmentISO);
    if (isNaN(dt.getTime())) {
      return NextResponse.json({ error: 'Invalid appointmentISO date' }, { status: 400 });
    }
    
    const isoDate = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    const hhmm    = `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const { start, end } = slotBoundsUTC(isoDate, hhmm);

    const cal = calendarClient();
    const { CALENDAR_ID, TZ } = getCalendarConfig();

    // Debug log (server terminal, not browser)
    // console.log('DEBUG booking env', {
    //   CALENDAR_ID,
    //   TZ,
    //   hasKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    //   hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // });

    const summary = `${body.serviceType} — ${body.applianceType}`;
    const description =
      `Customer: ${body.customerName || ''}\nEmail: ${body.customerEmail}\nPhone: ${body.phone}\n` +
      `Address: ${body.serviceAddress}\nZIP: ${body.zipCode}\n` +
      `Brand: ${body.brand}${body.serialNumber ? `\nS/N: ${body.serialNumber}` : ''}\n` +
      (body.isOrangeCounty != null ? `OC: ${body.isOrangeCounty}\n` : '') +
      (body.serviceFee != null ? `Service Fee: $${body.serviceFee}\n` : '');

    const eventRes = await cal.events.insert({
      calendarId: CALENDAR_ID as string,
      requestBody: {
        summary,
        description,
        start: { dateTime: start, timeZone: TZ },
        end:   { dateTime: end,   timeZone: TZ },
        location: body.serviceAddress,
        reminders: { useDefault: true },
        transparency: 'opaque',
        visibility: 'private',
      },
    });

    const event = eventRes.data;
    if (!event.id) {
      return NextResponse.json({ error: 'No event id returned from Google Calendar' }, { status: 502 });
    }

    // Create booking in database
    const booking = await prisma.booking.upsert({
      where: { googleEventId: event.id },
      create: {
        googleEventId: event.id,
        date: isoDate,
        startTime: hhmm,
        durationMinutes: body.durationMinutes || 60,
        customerName: body.customerName ?? null,
        customerEmail: body.customerEmail,
        phone: body.phone,
        serviceType: body.serviceType,
        applianceType: body.applianceType,
        brand: body.brand,
        serviceAddress: body.serviceAddress,
        zipCode: body.zipCode,
        status: 'CONFIRMED',
      },
      update: {
        date: isoDate,
        startTime: hhmm,
        durationMinutes: body.durationMinutes || 60,
        status: 'CONFIRMED',
      },
    });

    // Send confirmation email
    try {
      await sendAppointmentConfirmation({
        customerName: body.customerName || '',
        customerEmail: body.customerEmail,
        appointmentDate: isoDate,
        appointmentTime: hhmm,
        serviceType: body.serviceType,
        applianceType: body.applianceType,
        brand: body.brand,
        serviceAddress: body.serviceAddress,
        phone: body.phone,
        eventId: event.id,
        bookingId: booking.id,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ 
      ok: true, 
      eventId: event.id, 
      bookingId: booking.id,
      htmlLink: event.htmlLink 
    });
  } catch (e: any) {
    console.error('Booking API error:', e);
    return NextResponse.json({ 
      error: e?.message || 'Failed to book appointment',
      details: e?.stack || 'Unknown error'
    }, { status: 500 });
  }
}
