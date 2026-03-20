import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        currency: donation.paymentMethod === 'PAYPAL' ? 'USD' : 'ZAR',
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
        adminNotes: 'Backfilled from a completed donation record because no transaction ledger entry existed.',
        createdAt: donation.createdAt,
      },
    });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
