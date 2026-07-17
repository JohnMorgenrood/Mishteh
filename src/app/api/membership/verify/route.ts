import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getYocoPaymentDetails, isYocoPaymentSuccessful } from '@/lib/yoco';
import { membershipEndFrom } from '@/lib/membership';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const { paymentId } = await request.json();
  const payment = await prisma.membershipPayment.findFirst({ where: { id: paymentId, userId: session.user.id } });
  if (!payment?.checkoutId) return NextResponse.json({ error: 'Membership payment not found.' }, { status: 404 });

  if (payment.status === 'COMPLETED') return NextResponse.json({ active: true, membershipExpiresAt: payment.membershipUntil });
  const yocoPayment = await getYocoPaymentDetails(payment.checkoutId);
  if (!isYocoPaymentSuccessful(yocoPayment.status)) return NextResponse.json({ error: 'Payment has not completed yet.' }, { status: 409 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { membershipExpiresAt: true } });
  const now = new Date();
  const membershipFrom = user?.membershipExpiresAt && user.membershipExpiresAt > now ? user.membershipExpiresAt : now;
  const membershipUntil = membershipEndFrom(membershipFrom);
  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { membershipExpiresAt: membershipUntil } }),
    prisma.membershipPayment.update({ where: { id: payment.id }, data: { status: 'COMPLETED', membershipFrom, membershipUntil } }),
  ]);
  return NextResponse.json({ active: true, membershipExpiresAt: membershipUntil });
}
