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
    const technicianId = searchParams.get("technicianId") || session.user.id

    // Get all bookings assigned to this technician
    const allBookings = await prisma.booking.findMany({
      where: {
        assignedTechnicianId: technicianId,
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        date: "asc",
      },
    })

    // Get technician info
    const technician = await prisma.user.findUnique({
      where: { id: technicianId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    return NextResponse.json({
      technician,
      session: {
        userId: session.user.id,
        userEmail: session.user.email,
        userRole: session.user.role,
      },
      allAssignedBookings: allBookings.map(b => ({
        id: b.id,
        status: b.status,
        assignedTechnicianId: b.assignedTechnicianId,
        technician: b.technician,
        date: b.date,
        customerName: b.customerName,
      })),
      counts: {
        total: allBookings.length,
        pending: allBookings.filter(b => b.status === "PENDING").length,
        confirmed: allBookings.filter(b => b.status === "CONFIRMED").length,
        submitted: allBookings.filter(b => b.status === "SUBMITTED_TO_CLIENT").length,
        canceled: allBookings.filter(b => b.status === "CANCELED").length,
        completed: allBookings.filter(b => b.status === "COMPLETED").length,
      }
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

