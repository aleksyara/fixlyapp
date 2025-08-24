import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

    const booking = await prisma.booking.update({
      where: { id: id },
      data: { assignedTechnicianId: technicianId },
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

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error assigning technician:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
