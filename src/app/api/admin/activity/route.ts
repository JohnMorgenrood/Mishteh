import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const OWNER_EMAILS = ['mishteh144@gmail.com', 'golearnx@gmail.com'];

// GET /api/admin/activity - Get all activities
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !OWNER_EMAILS.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Activity model doesn't have relations, so we fetch basic data
    // and then enrich it with user/request info if IDs are present
    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Enrich activities with user and request data
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        let user = null;
        let request = null;

        if (activity.userId) {
          user = await prisma.user.findUnique({
            where: { id: activity.userId },
            select: { id: true, fullName: true, email: true },
          });
        }

        if (activity.requestId) {
          request = await prisma.request.findUnique({
            where: { id: activity.requestId },
            select: { id: true, title: true },
          });
        }

        return { ...activity, user, request };
      })
    );

    return NextResponse.json({ activities: enrichedActivities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
