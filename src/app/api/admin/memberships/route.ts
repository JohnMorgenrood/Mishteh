import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const OWNERS = ['mishteh144@gmail.com', 'golearnx@gmail.com'];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !OWNERS.includes(session.user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const now = new Date();
  const [users, revenue] = await Promise.all([
    prisma.user.findMany({ where: { userType: { not: 'ADMIN' } }, select: { id: true, fullName: true, email: true, membershipTrialEndsAt: true, membershipExpiresAt: true, createdAt: true, membershipPayments: { where: { status: 'COMPLETED' }, select: { amount: true }, orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } }),
    prisma.membershipPayment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true }, _count: true }),
  ]);
  const rows = users.map((user) => ({ ...user, status: user.membershipExpiresAt && user.membershipExpiresAt > now ? 'ACTIVE' : user.membershipTrialEndsAt && user.membershipTrialEndsAt > now ? 'TRIAL' : 'EXPIRED', paid: user.membershipPayments.reduce((sum, item) => sum + item.amount, 0), membershipPayments: undefined }));
  return NextResponse.json({ users: rows, stats: { active: rows.filter((u) => u.status === 'ACTIVE').length, trials: rows.filter((u) => u.status === 'TRIAL').length, expired: rows.filter((u) => u.status === 'EXPIRED').length, payments: revenue._count, revenue: revenue._sum.amount || 0 } });
}
