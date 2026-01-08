const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== User Cleanup Script ===\n');

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      userType: true,
      createdAt: true,
      _count: {
        select: {
          requests: true,
          donations: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log('All users:');
  users.forEach(u => {
    console.log(`  ${u.email} - ${u.fullName} - ${u.userType} - Requests: ${u._count.requests}, Donations: ${u._count.donations}`);
  });

  // Define emails to KEEP (real admin users)
  const keepEmails = [
    'mishteh144@gmail.com',
    'rubryoal@gmail.com',
    // Add the sample requester we just created
    'sample.requester@mishteh.com',
  ];

  // Also keep any ADMIN users
  const usersToKeep = users.filter(u => 
    keepEmails.some(email => u.email.toLowerCase().includes(email.toLowerCase())) ||
    u.userType === 'ADMIN'
  );

  const usersToDelete = users.filter(u => 
    !keepEmails.some(email => u.email.toLowerCase().includes(email.toLowerCase())) &&
    u.userType !== 'ADMIN' &&
    // Don't delete if they have requests we want to keep
    u._count.requests === 0
  );

  console.log('\n--- Users to KEEP ---');
  usersToKeep.forEach(u => console.log(`  ✓ ${u.email} (${u.userType})`));

  console.log('\n--- Users to DELETE (dummy/test users with no requests) ---');
  usersToDelete.forEach(u => console.log(`  ✗ ${u.email} (${u.userType})`));

  if (usersToDelete.length === 0) {
    console.log('\nNo users to delete.');
    return;
  }

  const deleteIds = usersToDelete.map(u => u.id);

  // Delete related data first
  console.log('\nDeleting related data...');

  // Delete security logs for these users
  const deletedLogs = await prisma.securityLog.deleteMany({
    where: { userId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedLogs.count} security logs`);

  // Delete comments by these users
  const deletedComments = await prisma.comment.deleteMany({
    where: { userId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedComments.count} comments`);

  // Delete likes by these users
  const deletedLikes = await prisma.like.deleteMany({
    where: { userId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedLikes.count} likes`);

  // Delete donations by these users
  const deletedDonations = await prisma.donation.deleteMany({
    where: { donorId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedDonations.count} donations`);

  // Delete donor preferences
  const deletedPrefs = await prisma.donorPreference.deleteMany({
    where: { userId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedPrefs.count} donor preferences`);

  // Delete documents by these users
  const deletedDocs = await prisma.document.deleteMany({
    where: { userId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedDocs.count} documents`);

  // Delete the users
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedUsers.count} users`);

  console.log('\n✅ Cleanup complete!');

  // Show remaining users
  const remaining = await prisma.user.findMany({
    select: { email: true, fullName: true, userType: true }
  });
  console.log('\nRemaining users:');
  remaining.forEach(u => console.log(`  • ${u.email} (${u.fullName}) - ${u.userType}`));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
