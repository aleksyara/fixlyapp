const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTechnician() {
  try {
    const email = 'sideks2210@gmail.com';
    
    console.log(`🔍 Checking for technician: ${email}\n`);
    
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found in database`);
      console.log('\n📋 All technicians in database:');
      const technicians = await prisma.user.findMany({
        where: { role: 'TECHNICIAN' },
        select: {
          email: true,
          name: true,
          createdAt: true
        }
      });
      if (technicians.length === 0) {
        console.log('   No technicians found');
      } else {
        technicians.forEach((tech, index) => {
          console.log(`   ${index + 1}. ${tech.email} (${tech.name || 'N/A'})`);
        });
      }
    } else {
      console.log('✅ User found:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('\n⚠️  Password is stored as a hash and cannot be retrieved.');
      console.log('   Use the reset-password script to set a new password.');
    }

  } catch (error) {
    console.error('❌ Error checking technician:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTechnician();

