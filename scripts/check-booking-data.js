const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgres://fb60d1f7c7b8993b59d8a5e7d3d4bdb28e3401d9282e20251de5b0e9e72ccf19:sk_vyH1cK35BBe8BB6R-kEdm@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function checkBookingData() {
  try {
    console.log('🔍 Checking booking and user data...\n');

    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });

    console.log('👥 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.email || 'No email'} (${user.username}) - ${user.role}`);
    });

    // Check bookings
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        customerEmail: true,
        customerName: true,
        date: true,
        status: true
      }
    });

    console.log('\n📅 Bookings in database:');
    bookings.forEach(booking => {
      console.log(`  - ${booking.customerEmail} (${booking.customerName}) - ${booking.date} - ${booking.status}`);
    });

    // Check for orphaned bookings (bookings with emails not in users table)
    const orphanedBookings = bookings.filter(booking => 
      !users.some(user => user.email === booking.customerEmail)
    );

    console.log('\n⚠️  Orphaned bookings (emails not in users table):');
    if (orphanedBookings.length === 0) {
      console.log('  None found');
    } else {
      orphanedBookings.forEach(booking => {
        console.log(`  - ${booking.customerEmail} (${booking.customerName})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookingData();
