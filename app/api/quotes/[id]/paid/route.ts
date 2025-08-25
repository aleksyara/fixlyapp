import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the quote
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        booking: true,
        technician: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check if user has permission to mark this quote as paid
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only the client who owns the booking or admin can mark quote as paid
    if (quote.booking.customerEmail !== user.email && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update quote status to PAID
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: { status: 'PAID' },
      include: {
        booking: true,
        technician: true,
      },
    });

    // Create notification for technician
    await prisma.notification.create({
      data: {
        userId: quote.technicianId,
        type: 'QUOTE_APPROVED',
        title: 'Quote Paid',
        message: `Your quote for ${quote.booking.customerName} has been paid.`,
        data: { 
          quoteId: quote.id, 
          bookingId: quote.bookingId,
          amount: quote.amount 
        },
      },
    });

    // Create notification for admin
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'QUOTE_APPROVED',
          title: 'Quote Paid',
          message: `Quote for ${quote.booking.customerName} has been paid.`,
          data: { 
            quoteId: quote.id, 
            bookingId: quote.bookingId,
            amount: quote.amount 
          },
        },
      });
    }

    return NextResponse.json({
      message: 'Quote marked as paid successfully',
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('Error marking quote as paid:', error);
    return NextResponse.json(
      { error: 'Failed to mark quote as paid' },
      { status: 500 }
    );
  }
}
