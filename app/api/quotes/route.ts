import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is technician
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "TECHNICIAN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { bookingId, technicianId, amount, description } = await request.json()

    if (!bookingId || !technicianId || !amount || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the booking exists and is assigned to this technician
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.assignedTechnicianId !== technicianId) {
      return NextResponse.json({ error: "Booking not assigned to this technician" }, { status: 403 })
    }

    const quote = await prisma.quote.create({
      data: {
        bookingId,
        technicianId,
        amount: parseFloat(amount),
        description,
      },
      include: {
        booking: true,
        technician: true,
      },
    })

    // Update booking status to SUBMITTED_TO_CLIENT when quote is created
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "SUBMITTED_TO_CLIENT" },
    })

    // Create notification for admin
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    })

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "NEW_QUOTE",
          title: "New Quote Created",
          message: `A new quote has been created for ${booking.customerName} by ${user.name}`,
          data: { quoteId: quote.id, bookingId: booking.id },
        },
      })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error("Error creating quote:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
