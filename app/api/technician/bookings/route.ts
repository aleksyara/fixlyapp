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

    console.log(`Found ${bookings.length} bookings for technician ${technicianId}`, bookings.map(b => ({ id: b.id, status: b.status, assignedTechnicianId: b.assignedTechnicianId })))

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching technician bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
