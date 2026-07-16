import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const currentRequest = transaction.requestId
      ? await prisma.request.findUnique({ where: { id: transaction.requestId }, select: { title: true } })
      : null;

    return NextResponse.json({
      ...transaction,
      requestTitle: currentRequest?.title || transaction.requestTitle,
    });
  } catch (error: any) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes, approvedBy } = body;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        status,
        adminNotes,
        approvedBy,
        approvedAt: status === 'COMPLETED' ? new Date() : undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Transaction update error:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
