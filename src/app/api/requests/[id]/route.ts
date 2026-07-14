import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { moderateSupportiveContent } from '@/lib/content-moderation';
import { flagModerationIncident } from '@/lib/moderation-incident';

// GET - Fetch a single request by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const requestData: any = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            location: true,
            bio: true,
            ficaVerified: true,
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
                preferences: {
                  select: {
                    showDonorNamePublic: true,
                  },
                },
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

    const isPublic = ['ACTIVE', 'PARTIALLY_FUNDED'].includes(requestData.status);
    const canReview = session?.user?.userType === 'ADMIN';
    const isOwner = session?.user?.id === requestData.userId;

    if (!isPublic && !canReview && !isOwner) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.request.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    const sanitizedRequestData = {
      ...requestData,
      donations: requestData.donations.map((donation: any) => {
        const donorIsPublic = Boolean(donation.donor.preferences?.showDonorNamePublic);

        return {
          ...donation,
          donor: {
            fullName: donorIsPublic ? donation.donor.fullName : 'Private Donor',
          },
        };
      }),
    };

    return NextResponse.json(sanitizedRequestData);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      where: { id },
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

    const isAdmin = session.user.userType === 'ADMIN';

    if (!isAdmin) {
      const moderation = moderateSupportiveContent(
        [body.title || '', body.description || ''].join(' ')
      );
      if (!moderation.allowed) {
        await flagModerationIncident(session.user.id, moderation.reason);
        return NextResponse.json(
          { error: 'This content was blocked and your account was sent for administrator review.' },
          { status: 422 }
        );
      }
    }

    // Requesters may edit content, but only the admin review endpoint may publish it.
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        urgency: body.urgency,
        location: body.location,
        targetAmount: body.targetAmount,
        status: isAdmin ? body.status : 'PENDING',
        verified: isAdmin ? body.status === 'ACTIVE' : false,
        contentApproved: isAdmin ? existingRequest.contentApproved : false,
        contentApprovedAt: isAdmin ? existingRequest.contentApprovedAt : null,
        contentApprovedBy: isAdmin ? existingRequest.contentApprovedBy : null,
        donationsEnabled: isAdmin ? existingRequest.donationsEnabled : false,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns this request
    const existingRequest = await prisma.request.findUnique({
      where: { id },
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
      where: { id },
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
