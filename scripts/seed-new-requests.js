const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating 3 new sample requests with proper categories...');

  // Create a sample user first (or use existing)
  const password = await bcrypt.hash('SamplePass123!', 10);

  const sampleUser = await prisma.user.upsert({
    where: { email: 'sample.requester@mishteh.com' },
    update: {},
    create: {
      fullName: 'Sample Requester',
      email: 'sample.requester@mishteh.com',
      password: password,
      userType: 'REQUESTER',
      phone: '+27821234567',
      location: 'Cape Town, South Africa',
    },
  });

  console.log('Sample user created/found:', sampleUser.email);

  // 3 new requests with WORKING categories
  const newRequests = [
    {
      title: 'Help with Baby Formula and Diapers',
      description: 'I am a new mother struggling to afford baby formula and diapers for my 3-month-old. My husband lost his job recently and we are barely making ends meet. Any assistance would mean the world to our little family. The baby goes through about 8 diapers a day and formula is so expensive. I just want to make sure my baby is fed and comfortable.',
      category: 'NEWBORN_BABY',
      targetAmount: 1500,
      urgency: 'HIGH',
      location: 'Cape Town, South Africa',
    },
    {
      title: 'Need Help Paying Electricity Bill',
      description: 'Our electricity has been disconnected due to unpaid bills. I work as a domestic worker but my employer reduced my hours. I have 2 school-going children who need light to study in the evenings. The total outstanding amount is R2000 to get reconnected. I can pay back once I find additional work.',
      category: 'UTILITIES',
      targetAmount: 2000,
      urgency: 'CRITICAL',
      location: 'Johannesburg, South Africa',
    },
    {
      title: 'Medical Treatment for Chronic Illness',
      description: 'I have been diagnosed with diabetes and need help affording my monthly medication and check-ups. Without proper medication, my condition worsens and I cannot work. I am the sole provider for my elderly mother. The monthly medication costs around R800 and I need help for at least 3 months while I stabilize my work situation.',
      category: 'PRESCRIPTION_MEDS',
      targetAmount: 2400,
      urgency: 'HIGH',
      location: 'Durban, South Africa',
    },
  ];

  for (const request of newRequests) {
    const created = await prisma.request.create({
      data: {
        userId: sampleUser.id,
        title: request.title,
        description: request.description,
        category: request.category,
        targetAmount: request.targetAmount,
        urgency: request.urgency,
        location: request.location,
        status: 'ACTIVE', // Make them immediately visible
        currentAmount: 0,
        verified: true, // Mark as verified so they show up
        featured: true, // Feature them so they appear prominently
      },
    });
    console.log(`Created request: ${created.title} (Category: ${created.category})`);
  }

  console.log('\n✅ Successfully created 3 new sample requests!');
  console.log('Categories used: NEWBORN_BABY, UTILITIES, CHRONIC_ILLNESS');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
