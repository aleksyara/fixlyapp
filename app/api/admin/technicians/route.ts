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

    const technicians = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        technicianStatus: true,
        technicianBookings: {
          select: {
            id: true,
          }
        },
        quotes: {
          select: {
            id: true,
            status: true,
            amount: true,
          }
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(technicians)
  } catch (error) {
    console.error("Error fetching technicians:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
