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
    const { status } = body;

    if (!['ACTIVE', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const helpRequest = await prisma.request.update({
      where: { id: params.id },
      data: {
        status,
        verified: status === 'ACTIVE',
      },
    });

    // Create notification for requester
    await prisma.notification.create({
      data: {
        userId: helpRequest.userId,
        title: status === 'ACTIVE' ? 'Request Approved!' : 'Request Rejected',
        message: status === 'ACTIVE'
          ? 'Your request has been approved and is now live.'
          : 'Your request has been rejected. Please review the guidelines and try again.',
        type: 'request_status',
        link: `/requests/${helpRequest.id}`,
      },
    });

    return NextResponse.json({
      message: `Request ${status.toLowerCase()} successfully`,
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
