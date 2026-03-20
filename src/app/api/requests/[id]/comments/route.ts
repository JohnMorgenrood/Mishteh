import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { moderateSupportiveContent } from '@/lib/content-moderation';

// GET /api/requests/[id]/comments - Get comments for a request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { requestId: requestId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: { requestId: requestId },
      }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { message: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/requests/[id]/comments - Add a comment to a request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'You must be logged in to comment' },
        { status: 401 }
      );
    }

    const { id: requestId } = await params;
    const body = await request.json();
    const { content } = body;

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { message: 'Comment content is required' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { message: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { message: 'Comment must be less than 500 characters' },
        { status: 400 }
      );
    }

    const moderationResult = moderateSupportiveContent(trimmedContent);
    if (!moderationResult.allowed) {
      return NextResponse.json(
        { message: moderationResult.reason },
        { status: 400 }
      );
    }

    // Basic spam protection - check for rate limiting
    const recentComments = await prisma.comment.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 60000), // Last minute
        },
      },
    });

    if (recentComments >= 5) {
      return NextResponse.json(
        { message: 'You are commenting too fast. Please wait a moment.' },
        { status: 429 }
      );
    }

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

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: trimmedContent,
        userId: session.user.id,
        requestId: requestId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
    });

    // Create activity entry
    await prisma.activity.create({
      data: {
        type: 'COMMENT',
        userId: session.user.id,
        requestId: requestId,
        metadata: JSON.stringify({
          userName: session.user.name || 'Someone',
          commentPreview: trimmedContent.substring(0, 50),
        }),
      },
    });

    return NextResponse.json({
      comment,
      message: 'Comment added successfully',
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { message: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
