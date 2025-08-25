import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status || !['READY_TO_WORK', 'DAY_OFF'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if user is a technician
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'Only technicians can update status' }, { status: 403 });
    }

    // Update technician status
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { technicianStatus: status },
    });

    return NextResponse.json({
      message: 'Status updated successfully',
      status: updatedUser.technicianStatus,
    });
  } catch (error) {
    console.error('Error updating technician status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { technicianStatus: true, role: true },
    });

    if (!user || user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'User not found or not a technician' }, { status: 404 });
    }

    return NextResponse.json({
      status: user.technicianStatus,
    });
  } catch (error) {
    console.error('Error fetching technician status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
