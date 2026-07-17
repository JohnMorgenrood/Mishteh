import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createYocoCheckout } from '@/lib/yoco';
import { createMembershipReminder, getMembershipStatus, MEMBERSHIP_PRICE_ZAR } from '@/lib/membership';
import { getYocoPaymentDetails, isYocoPaymentSuccessful } from '@/lib/yoco';
import { membershipEndFrom } from '@/lib/membership';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const pending = await prisma.membershipPayment.findFirst({ where: { userId: session.user.id, status: 'PENDING', checkoutId: { not: null } }, orderBy: { createdAt: 'desc' } });
  if (pending?.checkoutId) {
    try {
      const checkout = await getYocoPaymentDetails(pending.checkoutId);
      if (isYocoPaymentSuccessful(checkout.status)) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { membershipExpiresAt: true } });
        const now = new Date();
        const membershipFrom = user?.membershipExpiresAt && user.membershipExpiresAt > now ? user.membershipExpiresAt : now;
        const membershipUntil = membershipEndFrom(membershipFrom);
        await prisma.$transaction([
          prisma.user.update({ where: { id: session.user.id }, data: { membershipExpiresAt: membershipUntil } }),
          prisma.membershipPayment.update({ where: { id: pending.id }, data: { status: 'COMPLETED', membershipFrom, membershipUntil } }),
        ]);
      }
    } catch (error) { console.error('Membership reconciliation failed:', error); }
  }
  const status = await getMembershipStatus(session.user.id, session.user.userType);
  await createMembershipReminder(session.user.id, status);
  const payments = await prisma.membershipPayment.findMany({ where: { userId: session.user.id }, select: { id: true, amount: true, currency: true, status: true, membershipUntil: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 12 });
  return NextResponse.json({ ...status, payments });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (session.user.userType === 'ADMIN') return NextResponse.json({ error: 'Admin accounts do not require membership.' }, { status: 400 });

  const payment = await prisma.membershipPayment.create({ data: { userId: session.user.id, amount: MEMBERSHIP_PRICE_ZAR } });
  try {
    const { checkoutUrl, checkoutId } = await createYocoCheckout({
      amount: MEMBERSHIP_PRICE_ZAR * 100,
      currency: 'ZAR',
      metadata: { membershipPaymentId: payment.id, userId: session.user.id, purpose: 'MISHTEH_MONTHLY_MEMBERSHIP' },
      successUrl: `${process.env.NEXTAUTH_URL}/membership/success?paymentId=${payment.id}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/membership?cancelled=true`,
      failureUrl: `${process.env.NEXTAUTH_URL}/membership?failed=true`,
    });
    await prisma.membershipPayment.update({ where: { id: payment.id }, data: { checkoutId } });
    return NextResponse.json({ checkoutUrl, paymentId: payment.id });
  } catch (error) {
    await prisma.membershipPayment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    console.error('Membership checkout error:', error);
    return NextResponse.json({ error: 'Unable to start membership checkout.' }, { status: 500 });
  }
}
