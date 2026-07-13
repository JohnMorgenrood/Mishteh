import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const helpRequest = await prisma.request.findUnique({
    where: { id },
    include: { user: { select: { id: true, fullName: true, email: true, phone: true, location: true, bio: true, image: true, idDocumentUrl: true, selfieUrl: true, ficaVerified: true, isSuspicious: true } } },
  });
  if (!helpRequest) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  return NextResponse.json({ request: helpRequest });
}

// PATCH - Approve or reject a request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, featured, category, contentApproved } = body;

    // Prepare update data
    const updateData: any = {};

    if (contentApproved !== undefined) {
      updateData.contentApproved = Boolean(contentApproved);
      updateData.contentApprovedAt = contentApproved ? new Date() : null;
      updateData.contentApprovedBy = contentApproved ? session.user.email : null;
    }

    if (status !== undefined) {
      if (!['ACTIVE', 'REJECTED'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }

      if (status === 'ACTIVE') {
        const requestOwner = await prisma.request.findUnique({
          where: { id },
          select: {
            contentApproved: true,
            user: {
              select: {
                fullName: true,
                phone: true,
                location: true,
                bio: true,
                image: true,
                idDocumentUrl: true,
                selfieUrl: true,
                ficaVerified: true,
                isSuspicious: true,
              },
            },
          },
        });

        if (!requestOwner) {
          return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (!requestOwner.contentApproved) {
          return NextResponse.json({ error: 'Approve the post content before publishing it.' }, { status: 409 });
        }
        const owner = requestOwner.user;
        const profileComplete = Boolean(
          owner.fullName?.trim() &&
          owner.phone?.trim() &&
          owner.location?.trim() &&
          owner.bio?.trim() &&
          owner.image?.trim() &&
          owner.idDocumentUrl?.trim() &&
          owner.selfieUrl?.trim()
        );

        if (!profileComplete || !owner.ficaVerified || owner.isSuspicious) {
          return NextResponse.json(
            { error: 'The post is approved, but the recipient must complete identity verification before it can be published and receive donations.' },
            { status: 409 }
          );
        }
      }
      updateData.status = status;
      updateData.verified = status === 'ACTIVE';
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    const helpRequest = await prisma.request.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            location: true,
            bio: true,
            image: true,
            idDocumentUrl: true,
            selfieUrl: true,
            ficaVerified: true,
            isSuspicious: true,
          },
        },
      },
    });

    const message = status 
      ? `Request ${status.toLowerCase()} successfully`
      : featured !== undefined
      ? `Request ${featured ? 'featured' : 'unfeatured'} successfully`
      : category !== undefined
      ? 'Request category updated successfully'
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
