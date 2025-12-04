const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTechBookings() {
  try {
    // Get Tech Alex's ID
    const techAlex = await prisma.user.findUnique({
      where: { email: 'aleksei.yarantsev@gmail.com' },
    });

    if (!techAlex) {
      console.log('❌ Tech Alex not found');
      return;
    }

    console.log(`\n🔍 Checking bookings for Tech Alex (${techAlex.email})`);
    console.log(`   User ID: ${techAlex.id}\n`);

    // Get ALL bookings assigned to Tech Alex
    const allBookings = await prisma.booking.findMany({
      where: {
        assignedTechnicianId: techAlex.id,
      },
      include: {
        quotes: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log(`📊 Total bookings assigned to Tech Alex: ${allBookings.length}\n`);

    if (allBookings.length === 0) {
      console.log('❌ No bookings found assigned to Tech Alex');
      return;
    }

    // Group by status
    const byStatus = {};
    allBookings.forEach(b => {
      if (!byStatus[b.status]) {
        byStatus[b.status] = [];
      }
      byStatus[b.status].push(b);
    });

    console.log('📋 Bookings by Status:');
    Object.keys(byStatus).forEach(status => {
      console.log(`   ${status}: ${byStatus[status].length} bookings`);
    });

    console.log('\n📋 Bookings by Quote Status:');
    const withQuotes = allBookings.filter(b => b.quotes.length > 0);
    const withoutQuotes = allBookings.filter(b => b.quotes.length === 0);
    console.log(`   With quotes: ${withQuotes.length}`);
    console.log(`   Without quotes: ${withoutQuotes.length}`);

    console.log('\n🔍 Detailed Breakdown:\n');
    allBookings.forEach((booking, index) => {
      console.log(`${index + 1}. Booking ID: ${booking.id}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Date: ${booking.date} at ${booking.startTime}`);
      console.log(`   Customer: ${booking.customerName || booking.customerEmail}`);
      console.log(`   Quotes: ${booking.quotes.length} (${booking.quotes.map(q => q.status).join(', ') || 'none'})`);
      console.log(`   Would show in Tech Dashboard: ${!['SUBMITTED_TO_CLIENT', 'CANCELED', 'COMPLETED'].includes(booking.status)}`);
      console.log(`   Would show in Orders to Complete: ${!['SUBMITTED_TO_CLIENT', 'CANCELED', 'COMPLETED'].includes(booking.status) && booking.quotes.length === 0}`);
      console.log('');
    });

    // Check what the API would return
    const apiBookings = allBookings.filter(b => 
      !['SUBMITTED_TO_CLIENT', 'CANCELED', 'COMPLETED'].includes(b.status)
    );

    console.log(`\n✅ Bookings that would be returned by API: ${apiBookings.length}`);
    console.log(`   Orders to Complete (no quotes): ${apiBookings.filter(b => b.quotes.length === 0).length}`);
    console.log(`   Assigned Bookings (all): ${apiBookings.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTechBookings();

