import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  _request: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { message: 'Comments on personal requests are closed. Please join the moderated community Posts page.' },
    { status: 410 }
  );
}
