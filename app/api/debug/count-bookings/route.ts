import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Get all bookings for this email
    const allBookings = await prisma.booking.findMany({
      where: {
        customerEmail: email
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        status: true,
        googleEventId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Count by status
    const confirmed = allBookings.filter(b => b.status === 'CONFIRMED').length;
    const canceled = allBookings.filter(b => b.status === 'CANCELED').length;

    return NextResponse.json({
      email,
      totalBookings: allBookings.length,
      confirmedBookings: confirmed,
      canceledBookings: canceled,
      bookings: allBookings
    });

  } catch (error: any) {
    console.error('Count bookings error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
