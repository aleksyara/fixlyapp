import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calendarClient, getCalendarConfig } from '@/lib/google-calendar';
import { slotBoundsUTC } from '@/lib/availability';
import { sendAppointmentCancellation } from '@/lib/email';

// GET /api/appointment/[id] - Get appointment details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

// PUT /api/appointment/[id] - Update appointment
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.appointmentISO) {
      return NextResponse.json({ error: 'Missing appointmentISO' }, { status: 400 });
    }

    const dt = new Date(body.appointmentISO);
    if (isNaN(dt.getTime())) {
      return NextResponse.json({ error: 'Invalid appointmentISO date' }, { status: 400 });
    }

    const isoDate = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    const hhmm = `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const { start, end } = slotBoundsUTC(isoDate, hhmm);

    // Get current booking
    const currentBooking = await prisma.booking.findUnique({
      where: { id: id },
    });

    if (!currentBooking) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Update Google Calendar event
    const cal = calendarClient();
    const { CALENDAR_ID, TZ } = getCalendarConfig();

    const summary = `${body.serviceType} — ${body.applianceType}`;
    const description =
      `Customer: ${body.customerName || ''}\nEmail: ${body.customerEmail}\nPhone: ${body.phone}\n` +
      `Address: ${body.serviceAddress}\nZIP: ${body.zipCode}\n` +
      `Brand: ${body.brand}${body.serialNumber ? `\nS/N: ${body.serialNumber}` : ''}\n` +
      (body.isOrangeCounty != null ? `OC: ${body.isOrangeCounty}\n` : '') +
      (body.serviceFee != null ? `Service Fee: $${body.serviceFee}\n` : '');

    await cal.events.patch({
      calendarId: CALENDAR_ID as string,
      eventId: currentBooking.googleEventId,
      requestBody: {
        summary,
        description,
        start: { dateTime: start, timeZone: TZ },
        end: { dateTime: end, timeZone: TZ },
        location: body.serviceAddress,
        reminders: { useDefault: true },
        transparency: 'opaque',
        visibility: 'private',
      },
    });

    // Update booking in database
    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data: {
        date: isoDate,
        startTime: hhmm,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        phone: body.phone,
        serviceType: body.serviceType,
        applianceType: body.applianceType,
        brand: body.brand,
        serviceAddress: body.serviceAddress,
        zipCode: body.zipCode,
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json({ 
      ok: true, 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

// DELETE /api/appointment/[id] - Cancel appointment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Get current booking
    const currentBooking = await prisma.booking.findUnique({
      where: { id: id },
    });

    if (!currentBooking) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (currentBooking.status === 'CANCELED') {
      return NextResponse.json({ error: 'Appointment already cancelled' }, { status: 400 });
    }

    // Delete from Google Calendar
    try {
      const cal = calendarClient();
      const { CALENDAR_ID } = getCalendarConfig();
      
      await cal.events.delete({
        calendarId: CALENDAR_ID as string,
        eventId: currentBooking.googleEventId,
      });
    } catch (calendarError) {
      console.error('Error deleting from Google Calendar:', calendarError);
      // Continue with cancellation even if Google Calendar fails
    }

    // Update booking status to cancelled
    const cancelledBooking = await prisma.booking.update({
      where: { id: id },
      data: { status: 'CANCELED' },
    });

    // Send cancellation email
    try {
      await sendAppointmentCancellation({
        customerName: currentBooking.customerName || '',
        customerEmail: currentBooking.customerEmail,
        appointmentDate: currentBooking.date,
        appointmentTime: currentBooking.startTime,
        serviceType: currentBooking.serviceType,
        applianceType: currentBooking.applianceType,
        brand: currentBooking.brand,
        serviceAddress: currentBooking.serviceAddress,
        phone: currentBooking.phone,
        eventId: currentBooking.googleEventId,
        bookingId: currentBooking.id,
      });
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({ 
      ok: true, 
      booking: cancelledBooking 
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
  }
}
