const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFeatured() {
  const featured = await prisma.request.findMany({
    where: { featured: true },
    select: {
      id: true,
      title: true,
      featured: true,
      status: true,
    },
  });

  console.log(`\nFeatured requests: ${featured.length}`);
  featured.forEach(req => {
    console.log(`- ${req.title} (featured: ${req.featured}, status: ${req.status})`);
  });

  const active = await prisma.request.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      title: true,
      featured: true,
      status: true,
    },
  });

  console.log(`\nActive requests: ${active.length}`);
  active.forEach(req => {
    console.log(`- ${req.title} (featured: ${req.featured})`);
  });

  await prisma.$disconnect();
}

checkFeatured();
