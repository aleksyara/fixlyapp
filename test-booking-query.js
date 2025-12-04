// Test query to see what's happening
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  // Get a technician ID
  const tech = await prisma.user.findFirst({
    where: { role: 'TECHNICIAN', email: { contains: 'alex' } },
    select: { id: true, email: true, name: true }
  });
  
  if (!tech) {
    console.log('No technician found');
    return;
  }
  
  console.log('Technician:', tech);
  
  // Get all bookings for this technician
  const allBookings = await prisma.booking.findMany({
    where: {
      assignedTechnicianId: tech.id,
    },
    select: {
      id: true,
      date: true,
      startTime: true,
      status: true,
      customerName: true,
      customerEmail: true,
      _count: {
        select: { quotes: true }
      }
    },
    orderBy: { date: 'asc' }
  });
  
  console.log('\nAll bookings for technician:', allBookings.length);
  allBookings.forEach(b => {
    console.log(`- ${b.date} ${b.startTime}: ${b.status}, quotes: ${b._count.quotes}`);
  });
  
  // Test the filtered query
  const filtered = await prisma.booking.findMany({
    where: {
      assignedTechnicianId: tech.id,
      status: {
        notIn: ["SUBMITTED_TO_CLIENT", "CANCELED", "COMPLETED"],
      },
    },
    include: {
      quotes: {
        select: { id: true },
      },
    },
  });
  
  console.log('\nFiltered bookings (excluding SUBMITTED_TO_CLIENT, CANCELED, COMPLETED):', filtered.length);
  
  const withoutQuotes = filtered.filter(b => b.quotes.length === 0);
  console.log('After removing bookings with quotes:', withoutQuotes.length);
  
  await prisma.$disconnect();
}

test().catch(console.error);
