import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getYocoPaymentDetails } from '@/lib/yoco';
import { calculateYocoBreakdown } from '@/lib/payment-fees';

function buildLegacyBackfillNote(paymentMethod?: string | null) {
  const gateway = paymentMethod || 'UNKNOWN';
  return `Legacy ${gateway} donation backfill. The database only preserved the completed donation payout amount, so gross paid, gateway fees, and original display currency may require manual review.`;
}

function getBackfillCurrency(paymentMethod?: string | null) {
  return paymentMethod === 'YOCO' ? 'ZAR' : 'USD';
}

async function backfillMissingDonationTransactions() {
  const completedDonations = await prisma.donation.findMany({
    where: {
      status: 'COMPLETED',
    },
    include: {
      donor: {
        select: {
          id: true,
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
    take: 200,
    orderBy: {
      createdAt: 'desc',
    },
  });

  for (const donation of completedDonations) {
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        type: 'DONATION',
        donorId: donation.donorId,
        requestId: donation.requestId,
        netAmount: donation.amount,
        paymentGateway: donation.paymentMethod || undefined,
        createdAt: {
          gte: new Date(donation.createdAt.getTime() - 5 * 60 * 1000),
          lte: new Date(donation.createdAt.getTime() + 5 * 60 * 1000),
        },
      },
    });

    if (existingTransaction) {
      continue;
    }

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
        adminNotes: buildLegacyBackfillNote(donation.paymentMethod),
        createdAt: donation.createdAt,
      },
    });
  }
}

async function finalizePendingYocoDonations() {
  const pendingDonations = await prisma.donation.findMany({
    where: {
      paymentMethod: 'YOCO',
      status: 'PLEDGED',
      paymentStatus: {
        in: ['PENDING', 'PROCESSING'],
      },
      paymentIntentId: {
        not: null,
      },
    },
    include: {
      donor: true,
      request: {
        include: {
          user: true,
        },
      },
    },
    take: 50,
    orderBy: {
      createdAt: 'desc',
    },
  });

  for (const donation of pendingDonations) {
    try {
      const paymentDetails = await getYocoPaymentDetails(donation.paymentIntentId!);

      if (paymentDetails.status === 'succeeded') {
        const alreadyTracked = await prisma.transaction.findFirst({
          where: {
            paymentId: donation.paymentIntentId,
            type: 'DONATION',
          },
        });

        if (donation.status !== 'COMPLETED') {
          await prisma.request.update({
            where: { id: donation.requestId },
            data: {
              currentAmount: {
                increment: donation.amount,
              },
            },
          });
        }

        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            status: 'COMPLETED',
            paymentStatus: 'COMPLETED',
          },
        });

        if (!alreadyTracked) {
          const totalPaid = typeof paymentDetails.amount === 'number'
            ? paymentDetails.amount / 100
            : Math.round((donation.amount / 0.964) * 100) / 100;
          const feeBreakdown = calculateYocoBreakdown(totalPaid);

          await prisma.transaction.create({
            data: {
              type: 'DONATION',
              status: 'COMPLETED',
              amount: totalPaid,
              feeAmount: feeBreakdown.totalFees,
              netAmount: donation.amount,
              currency: paymentDetails.currency || 'ZAR',
              paymentGateway: 'YOCO',
              paymentId: donation.paymentIntentId,
              gatewayResponse: JSON.stringify(paymentDetails),
              gatewayFee: feeBreakdown.processingFee,
              donorId: donation.donorId,
              donorName: donation.anonymous ? 'Anonymous' : donation.donor.fullName,
              donorEmail: donation.donor.email,
              recipientId: donation.request.userId,
              recipientName: donation.request.user.fullName,
              recipientEmail: donation.request.user.email,
              requestId: donation.requestId,
              requestTitle: donation.request.title,
              completedAt: new Date(),
              adminNotes: `Yoco donation auto-finalized from admin transactions. Donor paid: R${totalPaid.toFixed(2)}, requester receives: R${donation.amount.toFixed(2)}, Yoco fee: R${feeBreakdown.processingFee.toFixed(2)}, Mishteh fee: R${feeBreakdown.platformFee.toFixed(2)}.`,
            },
          });

          await prisma.transaction.create({
            data: {
              type: 'FEE',
              status: 'COMPLETED',
              amount: feeBreakdown.platformFee,
              feeAmount: 0,
              netAmount: feeBreakdown.platformFee,
              currency: paymentDetails.currency || 'ZAR',
              paymentGateway: 'YOCO',
              paymentId: `${donation.paymentIntentId}-mishteh-fee`,
              donorId: donation.donorId,
              donorName: donation.donor.fullName,
              donorEmail: donation.donor.email,
              recipientId: donation.request.userId,
              recipientName: donation.request.user.fullName,
              recipientEmail: donation.request.user.email,
              requestId: donation.requestId,
              requestTitle: donation.request.title,
              completedAt: new Date(),
              adminNotes: `Mishteh 1% platform fee on Yoco donation ${donation.paymentIntentId}.`,
            },
          });
        }
      } else if (paymentDetails.status === 'failed' || paymentDetails.status === 'cancelled') {
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            status: 'REFUNDED',
            paymentStatus: 'FAILED',
          },
        });
      }
    } catch (error) {
      console.error(`Failed to finalize pending Yoco donation ${donation.id}:`, error);
    }
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await finalizePendingYocoDonations();
    await backfillMissingDonationTransactions();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    // Build filter
    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (userId) {
      where.OR = [
        { donorId: userId },
        { recipientId: userId }
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const transaction = await prisma.transaction.create({
      data: body,
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
