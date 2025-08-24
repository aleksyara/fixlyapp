const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // Get the email from command line argument or use a default
    const email = process.argv[2] || 'fixlyappliances@gmail.com';
    const newRole = process.argv[3] || 'ADMIN'; // ADMIN, TECHNICIAN, or CLIENT

    console.log(`🔄 Updating user role for: ${email} to ${newRole}\n`);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!existingUser) {
      console.log(`❌ User with email ${email} not found`);
      console.log('\nAvailable users:');
      const allUsers = await prisma.user.findMany({
        select: { email: true, role: true }
      });
      allUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      return;
    }

    // Update user role
    await prisma.user.update({
      where: { email: email },
      data: { role: newRole }
    });

    console.log(`✅ Successfully updated ${email} to ${newRole} role`);
    console.log(`🔑 You can now sign in with this Google account and access the ${newRole.toLowerCase()} dashboard`);

  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
