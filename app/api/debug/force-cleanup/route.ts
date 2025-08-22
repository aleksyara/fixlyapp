import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Get all confirmed bookings first
    const beforeCleanup = await prisma.booking.findMany({
      where: {
        customerEmail: email,
        status: 'CONFIRMED'
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        googleEventId: true
      }
    });

    console.log(`Found ${beforeCleanup.length} confirmed bookings for ${email}:`);
    beforeCleanup.forEach(booking => {
      console.log(`  - ${booking.id}: ${booking.date} ${booking.startTime} (Event: ${booking.googleEventId})`);
    });

    // Cancel all confirmed bookings for this email
    const result = await prisma.booking.updateMany({
      where: {
        customerEmail: email,
        status: 'CONFIRMED'
      },
      data: {
        status: 'CANCELED'
      }
    });

    console.log(`Cancelled ${result.count} bookings for ${email}`);

    return NextResponse.json({
      success: true,
      email,
      cancelledCount: result.count,
      cancelledBookings: beforeCleanup
    });

  } catch (error: any) {
    console.error('Force cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
