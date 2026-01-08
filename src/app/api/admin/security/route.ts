import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/security - Get security logs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only owner can access security logs
    if (!session?.user || session.user.email !== 'mishteh144@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const eventType = searchParams.get('eventType');
    const suspicious = searchParams.get('suspicious');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (eventType) {
      where.eventType = eventType;
    }

    // Get security logs
    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              userType: true,
              isSuspicious: true,
            },
          },
        },
      }),
      prisma.securityLog.count({ where }),
    ]);

    // Get suspicious users
    const suspiciousUsers = await prisma.user.findMany({
      where: { isSuspicious: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        userType: true,
        signupIp: true,
        signupCountry: true,
        signupCity: true,
        suspiciousReason: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get stats
    const stats = await Promise.all([
      prisma.securityLog.count({ where: { eventType: 'SIGNUP_CREDENTIALS' } }),
      prisma.securityLog.count({ where: { eventType: 'SIGNUP_GOOGLE' } }),
      prisma.securityLog.count({ where: { eventType: 'LOGIN_FAILED' } }),
      prisma.securityLog.count({ where: { isVpn: true } }),
      prisma.user.count({ where: { isSuspicious: true } }),
    ]);

    // Get signups by country
    const countryStats = await prisma.securityLog.groupBy({
      by: ['country'],
      where: { 
        eventType: { in: ['SIGNUP_CREDENTIALS', 'SIGNUP_GOOGLE'] },
        country: { not: null },
      },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    return NextResponse.json({
      logs,
      suspiciousUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        credentialSignups: stats[0],
        googleSignups: stats[1],
        failedLogins: stats[2],
        vpnUsers: stats[3],
        suspiciousUsers: stats[4],
      },
      countryStats: countryStats.map(c => ({
        country: c.country || 'Unknown',
        count: c._count.country,
      })),
    });
  } catch (error) {
    console.error('Security logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch security logs' }, { status: 500 });
  }
}
