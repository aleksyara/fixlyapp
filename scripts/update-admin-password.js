const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgres://fb60d1f7c7b8993b59d8a5e7d3d4bdb28e3401d9282e20251de5b0e9e72ccf19:sk_vyH1cK35BBe8BB6R-kEdm@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function updateAdminPassword() {
  try {
    const email = 'fixlyappliances@gmail.com';
    const password = 'Security2000!';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🔧 Updating admin user password...\n');

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.log('❌ Admin user not found, creating new one...');
      
      await prisma.user.create({
        data: {
          email: email,
          username: email,
          password: hashedPassword,
          name: 'Fixly Appliance Admin',
          role: 'ADMIN'
        }
      });
      console.log('✅ Created new admin user');
    } else {
      console.log('✅ Found existing admin user, updating password...');
      
      await prisma.user.update({
        where: { email: email },
        data: {
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Updated admin user password');
    }

    console.log('\n🔑 Admin Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Role: ADMIN');
    console.log('\n🌐 Production URL: https://fixlyappliance.com');

  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
