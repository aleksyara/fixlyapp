const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgres://fb60d1f7c7b8993b59d8a5e7d3d4bdb28e3401d9282e20251de5b0e9e72ccf19:sk_vyH1cK35BBe8BB6R-kEdm@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function createAdminProd() {
  try {
    const email = 'fixlyappliances@gmail.com';
    const password = 'Security2000!';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🚀 Creating admin user in PRODUCTION database...\n');

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

    console.log('\n🔑 Login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Role: ADMIN');
    console.log('\n🌐 Production URL: https://fixlyappliance.com');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminProd();
