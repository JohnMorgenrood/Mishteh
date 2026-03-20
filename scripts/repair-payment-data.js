const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function buildLegacyBackfillNote(paymentMethod) {
  const gateway = paymentMethod || 'UNKNOWN';
  return `Legacy ${gateway} donation backfill. The database only preserved the completed donation payout amount, so gross paid, gateway fees, and original display currency may require manual review.`;
}

function getBackfillCurrency(paymentMethod) {
  if (paymentMethod === 'YOCO') {
    return 'ZAR';
  }

  return 'USD';
}

async function repairRequestTotals() {
  const requests = await prisma.request.findMany({
    select: {
      id: true,
      currentAmount: true,
      targetAmount: true,
      status: true,
      donations: {
        where: { status: 'COMPLETED' },
        select: { amount: true },
      },
    },
  });

  let updated = 0;

  for (const request of requests) {
    const completedTotal = Number(
      request.donations.reduce((sum, donation) => sum + donation.amount, 0).toFixed(2)
    );

    let nextStatus = request.status;
    if (!['WITHDRAWN', 'REJECTED'].includes(request.status)) {
      if (completedTotal <= 0) {
        nextStatus = 'PENDING';
      } else if (request.targetAmount && completedTotal >= request.targetAmount) {
        nextStatus = 'FUNDED';
      } else {
        nextStatus = 'PARTIALLY_FUNDED';
      }
    }

    if (request.currentAmount !== completedTotal || nextStatus !== request.status) {
      await prisma.request.update({
        where: { id: request.id },
        data: {
          currentAmount: completedTotal,
          status: nextStatus,
        },
      });
      updated += 1;
    }
  }

  return updated;
}

async function repairTransactions() {
  const completedDonations = await prisma.donation.findMany({
    where: { status: 'COMPLETED' },
    include: {
      donor: {
        select: {
          fullName: true,
          email: true,
        },
      },
      request: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  let created = 0;
  let noted = 0;

  for (const donation of completedDonations) {
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        type: 'DONATION',
        donorId: donation.donorId,
        requestId: donation.requestId,
        netAmount: donation.amount,
        createdAt: {
          gte: new Date(donation.createdAt.getTime() - 5 * 60 * 1000),
          lte: new Date(donation.createdAt.getTime() + 5 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const legacyNote = buildLegacyBackfillNote(donation.paymentMethod);

    if (!existingTransaction) {
      await prisma.transaction.create({
        data: {
          type: 'DONATION',
          status: 'COMPLETED',
          amount: donation.amount,
          feeAmount: 0,
          netAmount: donation.amount,
          currency: getBackfillCurrency(donation.paymentMethod),
          paymentGateway: donation.paymentMethod,
          paymentId: donation.paymentIntentId,
          donorId: donation.donorId,
          donorName: donation.anonymous ? 'Anonymous' : donation.donor.fullName,
          donorEmail: donation.donor.email,
          recipientId: donation.request.user.id,
          recipientName: donation.request.user.fullName,
          recipientEmail: donation.request.user.email,
          requestId: donation.requestId,
          requestTitle: donation.request.title,
          completedAt: donation.updatedAt,
          adminNotes: legacyNote,
          createdAt: donation.createdAt,
        },
      });
      created += 1;
      continue;
    }

    if (
      existingTransaction.paymentId == null ||
      existingTransaction.adminNotes?.includes('Backfilled from a completed donation record')
    ) {
      await prisma.transaction.update({
        where: { id: existingTransaction.id },
        data: {
          paymentGateway: donation.paymentMethod || existingTransaction.paymentGateway,
          paymentId: donation.paymentIntentId || existingTransaction.paymentId,
          adminNotes: legacyNote,
        },
      });
      noted += 1;
    }
  }

  return { created, noted };
}

async function main() {
  const requestUpdates = await repairRequestTotals();
  const transactionResult = await repairTransactions();

  console.log(
    JSON.stringify(
      {
        success: true,
        requestUpdates,
        createdTransactions: transactionResult.created,
        legacyTransactionsMarked: transactionResult.noted,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
