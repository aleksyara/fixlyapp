const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetTechnicianPassword() {
  try {
    // Get email from command line argument or use default
    const email = process.argv[2] || 'sideks2210@gmail.com';
    // Get password from command line argument or use default
    const password = process.argv[3] || 'Technician123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`🔧 Resetting password for technician: ${email}\n`);

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      console.log('\n📋 Available technicians:');
      const technicians = await prisma.user.findMany({
        where: { role: 'TECHNICIAN' },
        select: { email: true, name: true }
      });
      technicians.forEach((tech, index) => {
        console.log(`   ${index + 1}. ${tech.email} (${tech.name || 'N/A'})`);
      });
      return;
    }

    if (user.role !== 'TECHNICIAN') {
      console.log(`⚠️  Warning: User ${email} has role ${user.role}, not TECHNICIAN`);
      console.log('   Proceeding with password reset anyway...\n');
    }

    await prisma.user.update({
      where: { email: email },
      data: {
        password: hashedPassword
      }
    });

    console.log('✅ Password reset successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${user.role}`);

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTechnicianPassword();

