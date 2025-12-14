import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/requests/[id]/like - Toggle like on a request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'You must be logged in to like a request' },
        { status: 401 }
      );
    }

    const { id: requestId } = await params;

    // Check if request exists
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { message: 'Request not found' },
        { status: 404 }
      );
    }

    // Check if user already liked this request
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_requestId: {
          userId: session.user.id,
          requestId: requestId,
        },
      },
    });

    let liked: boolean;

    if (existingLike) {
      // Unlike - remove the like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      // Like - create new like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          requestId: requestId,
        },
      });
      liked = true;

      // Create activity entry for the like
      await prisma.activity.create({
        data: {
          type: 'LIKE',
          userId: session.user.id,
          requestId: requestId,
          metadata: JSON.stringify({
            userName: session.user.name || 'Someone',
          }),
        },
      });
    }

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { requestId: requestId },
    });

    return NextResponse.json({
      liked,
      likeCount,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { message: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

// GET /api/requests/[id]/like - Get like status and count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: requestId } = await params;

    const likeCount = await prisma.like.count({
      where: { requestId: requestId },
    });

    let liked = false;
    
    if (session?.user?.id) {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_requestId: {
            userId: session.user.id,
            requestId: requestId,
          },
        },
      });
      liked = !!existingLike;
    }

    return NextResponse.json({
      liked,
      likeCount,
    });
  } catch (error) {
    console.error('Error getting like status:', error);
    return NextResponse.json(
      { message: 'Failed to get like status' },
      { status: 500 }
    );
  }
}
