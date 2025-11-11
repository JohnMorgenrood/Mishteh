import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a single request by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestData = await prisma.request.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            location: true,
            bio: true,
          },
        },
        donations: {
          where: {
            anonymous: false,
          },
          select: {
            id: true,
            amount: true,
            message: true,
            createdAt: true,
            donor: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        documents: {
          where: {
            status: 'VERIFIED',
          },
          select: {
            id: true,
            documentType: true,
            fileName: true,
          },
        },
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });

    if (!requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.request.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(requestData);
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

// PATCH - Update a request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if user owns this request
    const existingRequest = await prisma.request.findUnique({
      where: { id: params.id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (existingRequest.userId !== session.user.id && session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to edit this request' },
        { status: 403 }
      );
    }

    // Update the request
    const updatedRequest = await prisma.request.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        urgency: body.urgency,
        location: body.location,
        targetAmount: body.targetAmount,
        status: body.status,
      },
    });

    return NextResponse.json({
      message: 'Request updated successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

// DELETE - Withdraw/delete a request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns this request
    const existingRequest = await prisma.request.findUnique({
      where: { id: params.id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (existingRequest.userId !== session.user.id && session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this request' },
        { status: 403 }
      );
    }

    // Mark as withdrawn instead of deleting
    await prisma.request.update({
      where: { id: params.id },
      data: { status: 'WITHDRAWN' },
    });

    return NextResponse.json({
      message: 'Request withdrawn successfully',
    });
  } catch (error) {
    console.error('Error withdrawing request:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw request' },
      { status: 500 }
    );
  }
}
