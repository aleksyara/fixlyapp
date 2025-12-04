import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendTechnicianAssignmentNotification } from "@/lib/email"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { technicianId } = await request.json()

    if (!technicianId) {
      return NextResponse.json({ error: "Technician ID is required" }, { status: 400 })
    }

    // Verify technician exists and has TECHNICIAN role
    const technician = await prisma.user.findUnique({
      where: { id: technicianId },
    })

    if (!technician || technician.role !== "TECHNICIAN") {
      return NextResponse.json({ error: "Invalid technician" }, { status: 400 })
    }

    // Check if technician is available (not on day off)
    if (technician.technicianStatus === "DAY_OFF") {
      return NextResponse.json({ error: "Technician is currently on day off and cannot be assigned new bookings" }, { status: 400 })
    }

    const booking = await prisma.booking.update({
      where: { id: id },
      data: { 
        assignedTechnicianId: technicianId,
        // Keep the existing status - don't change to CONFIRMED
      },
      include: { technician: true },
    })

    // Create notification for the technician
    await prisma.notification.create({
      data: {
        userId: technicianId,
        type: "NEW_BOOKING",
        title: "New Booking Assigned",
        message: `You have been assigned a new booking for ${booking.customerName} on ${booking.date}`,
        data: { bookingId: booking.id },
      },
    })

    // Send email notification to technician
    try {
      await sendTechnicianAssignmentNotification({
        technicianName: technician.name || technician.email || 'Technician',
        technicianEmail: technician.email || '',
        customerName: booking.customerName || '',
        customerEmail: booking.customerEmail,
        appointmentDate: booking.date,
        appointmentTime: booking.startTime,
        serviceType: booking.serviceType,
        applianceType: booking.applianceType,
        brand: booking.brand,
        serviceAddress: booking.serviceAddress,
        phone: booking.phone,
        bookingId: booking.id,
      });
    } catch (emailError) {
      console.error('Failed to send technician assignment email:', emailError);
      // Don't fail the assignment if email fails
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error assigning technician:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
