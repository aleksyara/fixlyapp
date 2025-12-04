import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendFollowUpEmail } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a technician
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "TECHNICIAN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the quote with booking information
    const quote = await prisma.quote.findUnique({
      where: { id: id },
      include: {
        booking: true,
        technician: true,
      },
    })

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // Verify the quote belongs to this technician
    if (quote.technicianId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Send follow-up email to the client
    try {
      await sendFollowUpEmail({
        customerName: quote.booking.customerName || '',
        customerEmail: quote.booking.customerEmail,
        technicianName: user.name || user.email || 'Technician',
        quoteAmount: quote.amount,
        quoteDescription: quote.description,
        serviceType: quote.booking.serviceType,
        applianceType: quote.booking.applianceType,
        serviceAddress: quote.booking.serviceAddress,
        phone: quote.booking.phone,
        quoteId: quote.id,
      });
    } catch (emailError) {
      console.error('Failed to send follow-up email:', emailError);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ message: "Follow-up email sent successfully" })
  } catch (error) {
    console.error("Error sending follow-up email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

