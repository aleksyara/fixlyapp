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
    // Get all confirmed bookings for this customer
    const existingBookings = await prisma.booking.findMany({
      where: {
        customerEmail: body.customerEmail,
        status: 'CONFIRMED'
      }
    });

    console.log(`Customer ${body.customerEmail} has ${existingBookings.length} confirmed bookings in database`);

    // Initialize calendar client
    const cal = calendarClient();
    const { CALENDAR_ID, TZ } = getCalendarConfig();

    // SIMPLE APPROACH: Always cancel all existing bookings for this email when creating a new one
    // This ensures only 1 booking per email at any time
    const existingConfirmedBookings = await prisma.booking.findMany({
      where: {
        customerEmail: body.customerEmail,
        status: 'CONFIRMED'
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        googleEventId: true
      }
    });

    if (existingConfirmedBookings.length > 0) {
      console.log(`Found ${existingConfirmedBookings.length} existing bookings for ${body.customerEmail}. Cancelling them...`);
      
      // Cancel all existing confirmed bookings for this email
      const cancelResult = await prisma.booking.updateMany({
        where: {
          customerEmail: body.customerEmail,
          status: 'CONFIRMED'
        },
        data: {
          status: 'CANCELED'
        }
      });

      console.log(`✓ Cancelled ${cancelResult.count} existing bookings for ${body.customerEmail}`);

      // Also try to delete the events from Google Calendar (best effort)
      for (const booking of existingConfirmedBookings) {
        try {
          await cal.events.delete({
            calendarId: CALENDAR_ID as string,
            eventId: booking.googleEventId
          });
          console.log(`✓ Deleted event ${booking.googleEventId} from Google Calendar`);
        } catch (error: any) {
          console.log(`⚠ Could not delete event ${booking.googleEventId} from calendar (${error?.status}): ${error?.message}`);
          // Continue anyway - the database record is already cancelled
        }
      }
    }

    const dt = new Date(body.appointmentISO);
    if (isNaN(dt.getTime())) {
      return NextResponse.json({ error: 'Invalid appointmentISO date' }, { status: 400 });
    }
    
    console.log('Received appointmentISO:', body.appointmentISO);
    console.log('Parsed to UTC Date:', dt.toISOString());
    console.log('Date in Pacific Time:', dt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    
    const isoDate = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    const hhmm    = `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    
    console.log('Extracted isoDate:', isoDate);
    console.log('Extracted hhmm:', hhmm);
    
    const { start, end } = slotBoundsUTC(isoDate, hhmm);
    
    console.log('Final calendar start time:', start);
    console.log('Final calendar end time:', end);

    // Check for duplicate bookings at the same time
    const duplicateBooking = await prisma.booking.findFirst({
      where: {
        date: isoDate,
        startTime: hhmm,
        status: 'CONFIRMED'
      }
    });

    if (duplicateBooking) {
      return NextResponse.json({ 
        error: 'This time slot is already booked. Please choose a different time.' 
      }, { status: 400 });
    }

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
