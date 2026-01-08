import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const OWNER_EMAILS = ['mishteh144@gmail.com', 'golearnx@gmail.com'];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !OWNER_EMAILS.includes(session.user.email || '')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeSecurityInfo = searchParams.get('includeSecurityInfo') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        userType: true,
        phone: true,
        location: true,
        createdAt: true,
        ficaVerified: true,
        image: true,
        // Security fields
        ...(includeSecurityInfo && {
          signupIp: true,
          signupCountry: true,
          signupCity: true,
          lastLoginIp: true,
          lastLoginAt: true,
          isSuspicious: true,
          suspiciousReason: true,
        }),
        _count: {
          select: {
            requests: true,
            donations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
