const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all requests
  const requests = await prisma.request.findMany({
    select: { id: true, title: true, createdAt: true }
  });

  console.log('Current requests:', requests.length);

  // Find duplicates (keep the first one, delete the rest)
  const seen = new Map();
  const duplicateIds = [];

  for (const r of requests) {
    if (seen.has(r.title)) {
      duplicateIds.push(r.id);
      console.log('Duplicate:', r.title);
    } else {
      seen.set(r.title, r.id);
    }
  }

  if (duplicateIds.length > 0) {
    await prisma.request.deleteMany({
      where: { id: { in: duplicateIds } }
    });
    console.log(`Deleted ${duplicateIds.length} duplicate requests`);
  }

  // Show final state
  const remaining = await prisma.request.findMany({
    select: { id: true, title: true, category: true, status: true }
  });
  console.log('\nFinal requests:');
  remaining.forEach(r => console.log(`  • ${r.title} (${r.category}) - ${r.status}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
