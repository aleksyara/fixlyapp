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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const bookings = await prisma.booking.findMany({
      include: {
        technician: true,
        quotes: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Update status to SUBMITTED_TO_CLIENT if booking has quotes but status is not set correctly
    const bookingsWithCorrectStatus = bookings.map((booking) => {
      if (booking.quotes.length > 0 && booking.status !== "SUBMITTED_TO_CLIENT") {
        return {
          ...booking,
          status: "SUBMITTED_TO_CLIENT" as const,
        }
      }
      return booking
    })

    return NextResponse.json(bookingsWithCorrectStatus)
  } catch (error) {
    console.error("Error fetching admin bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
