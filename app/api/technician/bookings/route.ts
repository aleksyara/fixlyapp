import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("🔍 Technician Bookings API - Session check")
    console.log("  Has session:", !!session)
    console.log("  User ID:", session?.user?.id || "N/A")
    console.log("  User email:", session?.user?.email || "N/A")
    console.log("  User role:", session?.user?.role || "N/A")
    
    if (!session?.user?.id) {
      console.error("❌ No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is a technician
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    console.log("🔍 Database user lookup:")
    console.log("  Found:", !!user)
    console.log("  User ID:", user?.id || "N/A")
    console.log("  Role:", user?.role || "N/A")

    if (!user || user.role !== "TECHNICIAN") {
      console.error("❌ User not found or not a technician")
      console.error("  Found:", !!user)
      console.error("  Role:", user?.role || "N/A")
      return NextResponse.json({ error: "Forbidden - Technician access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const technicianId = searchParams.get("technicianId")

    console.log("🔍 Query params:")
    console.log("  Technician ID from query:", technicianId || "N/A")
    console.log("  Session user ID:", session.user.id)
    console.log("  Match:", technicianId === session.user.id)

    if (!technicianId || technicianId !== session.user.id) {
      console.error("❌ Technician ID mismatch or missing")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // First, let's check if there are ANY bookings assigned to this technician
    const allAssignedBookings = await prisma.booking.findMany({
      where: {
        assignedTechnicianId: technicianId,
      },
    })

    console.log(`🔍 All bookings assigned to technician: ${allAssignedBookings.length} total`)
    if (allAssignedBookings.length > 0) {
      console.log("🔍 Booking IDs:", allAssignedBookings.map(b => b.id).join(", "))
      console.log("🔍 Booking statuses:", allAssignedBookings.map(b => b.status).join(", "))
    }

    // Return ALL bookings assigned to technician regardless of status
    const bookings = await prisma.booking.findMany({
      where: {
        assignedTechnicianId: technicianId,
      },
      include: {
        quotes: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Add quotes count to each booking and serialize dates
    const bookingsWithQuoteInfo = bookings.map(booking => ({
      id: booking.id,
      googleEventId: booking.googleEventId,
      date: booking.date,
      startTime: booking.startTime,
      durationMinutes: booking.durationMinutes,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      phone: booking.phone,
      serviceType: booking.serviceType,
      applianceType: booking.applianceType,
      brand: booking.brand,
      serviceAddress: booking.serviceAddress,
      zipCode: booking.zipCode,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      quotesCount: booking.quotes.length,
      hasQuote: booking.quotes.length > 0,
    }))

    console.log(`✅ Found ${bookingsWithQuoteInfo.length} bookings for technician ${technicianId} (all statuses)`)
    if (bookingsWithQuoteInfo.length > 0) {
      console.log("🔍 Booking IDs:", bookingsWithQuoteInfo.map(b => b.id).join(", "))
      console.log("🔍 Bookings with quotes:", bookingsWithQuoteInfo.filter(b => b.hasQuote).length)
      console.log("🔍 Bookings without quotes:", bookingsWithQuoteInfo.filter(b => !b.hasQuote).length)
    }

    return NextResponse.json(bookingsWithQuoteInfo)
  } catch (error) {
    console.error("❌ Error fetching technician bookings:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("❌ Error stack:", errorStack)
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 })
  }
}
