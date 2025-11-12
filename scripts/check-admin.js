const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndUpdateAdmin() {
  try {
    const email = 'golearnx@gmail.com';
    
    // Check current user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        userType: true,
      },
    });

    if (!user) {
      console.log(`❌ User ${email} not found`);
      return;
    }

    console.log('\n📋 Current User Status:');
    console.log('- Email:', user.email);
    console.log('- Name:', user.fullName);
    console.log('- User Type:', user.userType);
    console.log('- ID:', user.id);

    if (user.userType !== 'ADMIN') {
      console.log('\n🔄 Updating user type to ADMIN...');
      
      const updated = await prisma.user.update({
        where: { email },
        data: { userType: 'ADMIN' },
      });

      console.log('✅ Successfully updated to ADMIN');
      console.log('- New User Type:', updated.userType);
    } else {
      console.log('\n✅ User is already an ADMIN');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateAdmin();
