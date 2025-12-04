import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const technicianId = searchParams.get("technicianId")

    if (!technicianId || technicianId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        assignedTechnicianId: technicianId,
        // Exclude bookings that have been submitted to client, canceled, or completed
        status: {
          notIn: ["SUBMITTED_TO_CLIENT", "CANCELED", "COMPLETED"],
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    console.log(`Found ${bookings.length} bookings for technician ${technicianId}`)

    // Serialize dates to strings to avoid serialization issues
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }))

    return NextResponse.json(serializedBookings)
  } catch (error) {
    console.error("Error fetching technician bookings:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error stack:", errorStack)
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 })
  }
}
