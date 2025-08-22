import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Mark all confirmed bookings for this email as cancelled
    // This is a manual cleanup for testing purposes
    const result = await prisma.booking.updateMany({
      where: {
        customerEmail: email,
        status: 'CONFIRMED'
      },
      data: {
        status: 'CANCELED'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Cancelled ${result.count} bookings for ${email}`,
      cancelledCount: result.count
    });

  } catch (error: any) {
    console.error('Cleanup bookings error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
