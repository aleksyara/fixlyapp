import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { calendarClient, getCalendarConfig } from "@/lib/google-calendar"
import { slotBoundsUTC } from "@/lib/availability"
import { sendAppointmentUpdateConfirmation } from "@/lib/email"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || (user.role !== "TECHNICIAN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { date, time } = await request.json()

    if (!date || !time) {
      return NextResponse.json({ error: "Date and time are required" }, { status: 400 })
    }

    // Get current booking
    const booking = await prisma.booking.findUnique({
      where: { id: id },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verify technician has access (if technician)
    if (user.role === "TECHNICIAN" && booking.assignedTechnicianId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if time has changed
    const timeChanged = booking.date !== date || booking.startTime !== time

    // Update Google Calendar event
    const { CALENDAR_ID, TZ } = getCalendarConfig()
    const cal = calendarClient()
    const { start, end } = slotBoundsUTC(date, time)

    const summary = `${booking.serviceType} — ${booking.applianceType}`
    const description = `Customer: ${booking.customerName || ''}\nEmail: ${booking.customerEmail}\nPhone: ${booking.phone}\nAddress: ${booking.serviceAddress}\nZIP: ${booking.zipCode}\nBrand: ${booking.brand}`

    await cal.events.patch({
      calendarId: CALENDAR_ID as string,
      eventId: booking.googleEventId,
      requestBody: {
        summary,
        description,
        start: { dateTime: start, timeZone: TZ },
        end: { dateTime: end, timeZone: TZ },
        location: booking.serviceAddress,
        reminders: { useDefault: true },
      },
    })

    // Update booking in database
    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data: {
        date: date,
        startTime: time,
        status: booking.status === "SUBMITTED_TO_CLIENT" ? "SUBMITTED_TO_CLIENT" : "CONFIRMED",
      },
    })

    // Send confirmation email if time changed
    if (timeChanged) {
      try {
        await sendAppointmentUpdateConfirmation({
          customerName: booking.customerName || '',
          customerEmail: booking.customerEmail,
          appointmentDate: date,
          appointmentTime: time,
          serviceType: booking.serviceType,
          applianceType: booking.applianceType,
          brand: booking.brand,
          serviceAddress: booking.serviceAddress,
          phone: booking.phone,
          eventId: booking.googleEventId,
          bookingId: updatedBooking.id,
        })
      } catch (emailError) {
        console.error('Failed to send reschedule confirmation email:', emailError)
        // Don't fail the reschedule if email fails
      }
    }

    return NextResponse.json({ 
      ok: true, 
      booking: updatedBooking,
      timeChanged
    })
  } catch (error) {
    console.error("Error rescheduling booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

