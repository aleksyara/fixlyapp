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
      return NextResponse.json({ 
        error: "Access denied. Only technicians and administrators can reschedule bookings." 
      }, { status: 403 })
    }

    const { date, time } = await request.json()

    if (!date || !time) {
      return NextResponse.json({ 
        error: "Date and time are required. Please select both a date and time for the rescheduled appointment." 
      }, { status: 400 })
    }

    // Get current booking with quotes
    const booking = await prisma.booking.findUnique({
      where: { id: id },
      include: {
        quotes: {
          select: {
            technicianId: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ 
        error: "Booking not found. The booking may have been deleted or does not exist." 
      }, { status: 404 })
    }

    // Verify technician has access (if technician)
    if (user.role === "TECHNICIAN") {
      // Check if technician is assigned to the booking OR created a quote for it
      const isAssigned = booking.assignedTechnicianId === user.id
      const hasQuote = booking.quotes.some(quote => quote.technicianId === user.id)
      
      if (!isAssigned && !hasQuote) {
        return NextResponse.json({ 
          error: "You do not have permission to reschedule this booking. Only the assigned technician or the technician who created a quote for this booking can reschedule it." 
        }, { status: 403 })
      }
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
  } catch (error: any) {
    console.error("Error rescheduling booking:", error)
    
    // Provide more specific error messages
    if (error?.code === 'P2025') {
      return NextResponse.json({ 
        error: "Booking not found. The booking may have been deleted." 
      }, { status: 404 })
    }
    
    if (error?.message?.includes('Calendar')) {
      return NextResponse.json({ 
        error: "Failed to update Google Calendar event. Please try again or contact support if the issue persists." 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: error?.message || "An unexpected error occurred while rescheduling the booking. Please try again or contact support." 
    }, { status: 500 })
  }
}

