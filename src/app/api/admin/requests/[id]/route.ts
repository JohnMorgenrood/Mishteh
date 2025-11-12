import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - Approve or reject a request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, featured } = body;

    // Prepare update data
    const updateData: any = {};

    if (status !== undefined) {
      if (!['ACTIVE', 'REJECTED'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updateData.status = status;
      updateData.verified = status === 'ACTIVE';
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    const helpRequest = await prisma.request.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    const message = status 
      ? `Request ${status.toLowerCase()} successfully`
      : featured !== undefined
      ? `Request ${featured ? 'featured' : 'unfeatured'} successfully`
      : 'Request updated successfully';

    return NextResponse.json({
      message,
      request: helpRequest,
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
