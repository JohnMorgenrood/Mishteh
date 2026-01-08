const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('=== Cleaning up old requests and activity ===\n');

  // Get the 3 new requests we want to keep (created today with these specific categories)
  const newRequestCategories = ['NEWBORN_BABY', 'UTILITIES', 'PRESCRIPTION_MEDS'];
  
  // Find requests to keep (our 3 new ones)
  const requestsToKeep = await prisma.request.findMany({
    where: {
      category: { in: newRequestCategories },
      title: {
        in: [
          'Help with Baby Formula and Diapers',
          'Need Help Paying Electricity Bill',
          'Medical Treatment for Chronic Illness'
        ]
      }
    },
    select: { id: true, title: true, category: true }
  });

  console.log('Requests to KEEP:');
  requestsToKeep.forEach(r => console.log(`  ✓ ${r.title} (${r.category})`));

  const keepIds = requestsToKeep.map(r => r.id);

  // Find all old requests to delete
  const requestsToDelete = await prisma.request.findMany({
    where: {
      id: { notIn: keepIds }
    },
    select: { id: true, title: true, category: true }
  });

  console.log('\nRequests to DELETE:');
  requestsToDelete.forEach(r => console.log(`  ✗ ${r.title} (${r.category})`));

  const deleteIds = requestsToDelete.map(r => r.id);

  if (deleteIds.length === 0) {
    console.log('\nNo old requests to delete.');
    return;
  }

  // Delete in order: comments, likes, donations, documents, activity, then requests
  console.log('\nDeleting related data...');

  // Delete comments on old requests
  const deletedComments = await prisma.comment.deleteMany({
    where: { requestId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedComments.count} comments`);

  // Delete likes on old requests
  const deletedLikes = await prisma.like.deleteMany({
    where: { requestId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedLikes.count} likes`);

  // Delete donations to old requests
  const deletedDonations = await prisma.donation.deleteMany({
    where: { requestId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedDonations.count} donations`);

  // Delete documents for old requests
  const deletedDocs = await prisma.document.deleteMany({
    where: { requestId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedDocs.count} documents`);

  // Delete activity for old requests
  const deletedActivity = await prisma.activity.deleteMany({
    where: { requestId: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedActivity.count} activity records`);

  // Finally delete the old requests
  const deletedRequests = await prisma.request.deleteMany({
    where: { id: { in: deleteIds } }
  });
  console.log(`  - Deleted ${deletedRequests.count} requests`);

  // Also clean up any orphaned activity (activity with no valid request)
  const orphanedActivity = await prisma.activity.deleteMany({
    where: {
      requestId: { not: null },
      NOT: {
        requestId: { in: keepIds }
      }
    }
  });
  if (orphanedActivity.count > 0) {
    console.log(`  - Deleted ${orphanedActivity.count} orphaned activity records`);
  }

  console.log('\n✅ Cleanup complete!');
  
  // Show remaining requests
  const remaining = await prisma.request.findMany({
    select: { id: true, title: true, category: true, status: true }
  });
  console.log('\nRemaining requests:');
  remaining.forEach(r => console.log(`  • ${r.title} (${r.category}) - ${r.status}`));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
