const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'fixlyappliances@gmail.com';
    const password = 'Security2000!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      // Update existing user to admin role
      await prisma.user.update({
        where: { email: email },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          username: email
        }
      });
      console.log('✅ Updated existing user to ADMIN role:', email);
    } else {
      // Create new admin user
      await prisma.user.create({
        data: {
          email: email,
          username: email,
          password: hashedPassword,
          name: 'Fixly Appliance Admin',
          role: 'ADMIN'
        }
      });
      console.log('✅ Created new ADMIN user:', email);
    }

    console.log('🔑 Login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Role: ADMIN');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
