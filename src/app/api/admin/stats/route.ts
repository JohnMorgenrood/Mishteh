import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      totalUsers,
      totalRequests,
      totalDonations,
      pendingRequests,
      activeRequests,
      featuredRequests,
      pendingDocuments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.request.count(),
      prisma.donation.count(),
      prisma.request.count({ where: { status: 'PENDING' } }),
      prisma.request.count({ where: { status: 'ACTIVE' } }),
      prisma.request.count({ where: { featured: true, status: 'ACTIVE' } }),
      prisma.document.count({ where: { status: 'PENDING' } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalRequests,
      totalDonations,
      pendingRequests,
      activeRequests,
      featuredRequests,
      pendingDocuments,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
