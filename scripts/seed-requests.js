const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating dummy requesters and requests...');

  const dummyUsers = [
    { name: 'Sarah Thompson', email: 'sarah.t@example.com', location: 'Cape Town', phone: '+27823456789' },
    { name: 'Michael Nkosi', email: 'michael.n@example.com', location: 'Johannesburg', phone: '+27834567890' },
    { name: 'Fatima Hassan', email: 'fatima.h@example.com', location: 'Durban', phone: '+27845678901' },
    { name: 'David Chen', email: 'david.c@example.com', location: 'Pretoria', phone: '+27856789012' },
    { name: 'Lerato Molefe', email: 'lerato.m@example.com', location: 'Port Elizabeth', phone: '+27867890123' },
  ];

  const password = await bcrypt.hash('Password123', 10);

  // Create 5 dummy users
  for (const user of dummyUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        fullName: user.name,
        email: user.email,
        password: password,
        userType: 'REQUESTER',
        phone: user.phone,
        location: user.location,
      },
    });
  }

  console.log('Created dummy users');

  // Get all requesters
  const requesters = await prisma.user.findMany({
    where: { userType: 'REQUESTER' },
  });

  const requests = [
    {
      title: 'Medical Emergency - Surgery Needed',
      description: 'My mother needs urgent heart surgery. The hospital requires payment upfront and we cannot afford it. Any help would be deeply appreciated.',
      category: 'MEDICAL',
      amountNeeded: 25000,
      urgency: 'CRITICAL',
    },
    {
      title: 'School Fees for 3 Children',
      description: 'I lost my job during COVID and struggling to pay school fees for my three children. They are at risk of being expelled from school.',
      category: 'EDUCATION',
      amountNeeded: 8500,
      urgency: 'HIGH',
    },
    {
      title: 'Food and Groceries for Family',
      description: 'Single parent of 4 children. Need assistance with food and basic groceries for the month. Any contribution helps.',
      category: 'FOOD',
      amountNeeded: 2000,
      urgency: 'MEDIUM',
    },
    {
      title: 'Rent Payment - Facing Eviction',
      description: 'Lost my income due to company closure. Landlord threatening eviction. Need help with 2 months rent to get back on my feet.',
      category: 'RENT',
      amountNeeded: 12000,
      urgency: 'CRITICAL',
    },
    {
      title: 'Wheelchair for Disabled Son',
      description: 'My 8-year-old son needs a new wheelchair. His current one is broken and insurance won\'t cover a replacement.',
      category: 'MEDICAL',
      amountNeeded: 15000,
      urgency: 'HIGH',
    },
    {
      title: 'Business Startup - Small Bakery',
      description: 'Looking to start a small home bakery to support my family. Need help with equipment and initial supplies.',
      category: 'OTHER',
      amountNeeded: 18000,
      urgency: 'LOW',
    },
    {
      title: 'Funeral Expenses for Mother',
      description: 'My mother passed away unexpectedly. We need help covering funeral costs as we have no savings.',
      category: 'OTHER',
      amountNeeded: 10000,
      urgency: 'CRITICAL',
    },
    {
      title: 'Laptop for Online Studies',
      description: 'University student struggling with online classes. My old laptop died and I cannot afford a replacement.',
      category: 'EDUCATION',
      amountNeeded: 6000,
      urgency: 'MEDIUM',
    },
    {
      title: 'Diabetes Medication and Supplies',
      description: 'Need help covering monthly diabetes medication and testing supplies. Medical aid rejected my claim.',
      category: 'MEDICAL',
      amountNeeded: 3500,
      urgency: 'HIGH',
    },
    {
      title: 'Repair Damaged Home After Storm',
      description: 'Recent storm damaged our roof and windows. Family is exposed to elements. Need urgent repair funds.',
      category: 'OTHER',
      amountNeeded: 20000,
      urgency: 'CRITICAL',
    },
  ];

  // Create requests
  for (let i = 0; i < requests.length; i++) {
    const requester = requesters[i % requesters.length];
    const request = requests[i];

    await prisma.request.create({
      data: {
        userId: requester.id,
        title: request.title,
        description: request.description,
        category: request.category,
        targetAmount: request.amountNeeded,
        urgency: request.urgency,
        status: 'PENDING',
        location: requester.location,
      },
    });
  }

  console.log('✅ Created 10 dummy requests!');
  console.log('You can now log in as admin and approve them.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
