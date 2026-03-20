import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/activity - Get recent activity feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const cursor = searchParams.get('cursor');

    const activities = await prisma.activity.findMany({
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: 'desc' },
    });

    // Enrich activities with request and user info
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        if (activity.type === 'LIKE' && activity.userId && activity.requestId) {
          const activeLike = await prisma.like.findUnique({
            where: {
              userId_requestId: {
                userId: activity.userId,
                requestId: activity.requestId,
              },
            },
            select: { id: true },
          });

          if (!activeLike) {
            return null;
          }
        }

        let requestInfo = null;
        let userInfo = null;

        if (activity.requestId) {
          const request = await prisma.request.findUnique({
            where: { id: activity.requestId },
            select: {
              id: true,
              title: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  location: true,
                },
              },
            },
          });
          requestInfo = request;
        }

        if (activity.userId) {
          const user = await prisma.user.findUnique({
            where: { id: activity.userId },
            select: {
              id: true,
              fullName: true,
              image: true,
            },
          });
          userInfo = user;
        }

        let metadata = null;
        try {
          metadata = activity.metadata ? JSON.parse(activity.metadata) : null;
        } catch {
          metadata = null;
        }

        return {
          id: activity.id,
          type: activity.type,
          createdAt: activity.createdAt,
          metadata,
          request: requestInfo,
          user: userInfo,
        };
      })
    );

    // Filter out activities with missing data
    const validActivities = enrichedActivities.filter(
      (a) => a && (a.request || a.type === 'NEW_REQUEST')
    );

    const nextCursor =
      activities.length === limit ? activities[activities.length - 1].id : null;

    return NextResponse.json({
      activities: validActivities,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { message: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
