import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const OWNER_EMAILS = ['mishteh144@gmail.com', 'golearnx@gmail.com'];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !OWNER_EMAILS.includes(session.user.email || '')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get today's start timestamp
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalRequests,
      totalDonations,
      pendingRequests,
      activeRequests,
      featuredRequests,
      pendingDocuments,
      suspiciousUsers,
      todaySignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.request.count(),
      prisma.donation.count(),
      prisma.request.count({ where: { status: 'PENDING' } }),
      prisma.request.count({ where: { status: 'ACTIVE' } }),
      prisma.request.count({ where: { featured: true, status: 'ACTIVE' } }),
      prisma.document.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { isSuspicious: true } }).catch(() => 0),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalRequests,
      totalDonations,
      pendingRequests,
      activeRequests,
      featuredRequests,
      pendingDocuments,
      suspiciousUsers,
      todaySignups,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
