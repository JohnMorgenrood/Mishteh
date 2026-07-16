import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RequestCategory, UrgencyLevel } from '@prisma/client';
import { moderateSupportiveContent } from '@/lib/content-moderation';

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
    const { status, featured, category, contentApproved, title, description, urgency, location, targetAmount } = body;

    // Prepare update data
    const updateData: any = {};

    if (title !== undefined || description !== undefined || location !== undefined || targetAmount !== undefined || urgency !== undefined) {
      const existing = await prisma.request.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      const nextTitle = title?.trim() ?? existing.title;
      const nextDescription = description?.trim() ?? existing.description;
      const nextLocation = location?.trim() ?? existing.location;
      const nextTarget = targetAmount === null || targetAmount === '' ? null : Number(targetAmount ?? existing.targetAmount);
      if (nextTitle.length < 5) return NextResponse.json({ error: 'Title must be at least 5 characters.' }, { status: 400 });
      if (nextDescription.length < 20) return NextResponse.json({ error: 'Story must be at least 20 characters.' }, { status: 400 });
      if (nextLocation.length < 2) return NextResponse.json({ error: 'Location is required.' }, { status: 400 });
      if (nextTarget !== null && (!Number.isFinite(nextTarget) || nextTarget < 50)) {
        return NextResponse.json({ error: 'The minimum request target is R50.' }, { status: 400 });
      }
      if (urgency !== undefined && !Object.values(UrgencyLevel).includes(urgency)) {
        return NextResponse.json({ error: 'Invalid urgency.' }, { status: 400 });
      }
      const moderation = moderateSupportiveContent(`${nextTitle} ${nextDescription}`);
      if (!moderation.allowed) return NextResponse.json({ error: moderation.reason }, { status: 422 });
      Object.assign(updateData, { title: nextTitle, description: nextDescription, location: nextLocation, targetAmount: nextTarget });
      if (urgency !== undefined) updateData.urgency = urgency;
    }

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
            targetAmount: true,
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
                managedByAdmin: true,
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
        if (requestOwner.targetAmount !== null && requestOwner.targetAmount < 50) {
          return NextResponse.json({ error: 'Correct the target amount to at least R50 before publishing.' }, { status: 409 });
        }
        const owner = requestOwner.user;
        if (owner.isSuspicious) {
          return NextResponse.json(
            { error: 'Clear the recipient security flag before publishing this post.' },
            { status: 409 }
          );
        }
        updateData.verified = owner.ficaVerified;
        updateData.donationsEnabled = owner.ficaVerified || owner.managedByAdmin;
      }
      updateData.status = status;
      if (status === 'REJECTED') {
        updateData.verified = false;
        updateData.donationsEnabled = false;
      }
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    if (category !== undefined) {
      if (!Object.values(RequestCategory).includes(category)) {
        return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
      }
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

    // Transactions keep a historical title snapshot for reporting. Keep that
    // snapshot aligned when an administrator corrects the request title.
    if (title !== undefined) {
      await prisma.transaction.updateMany({
        where: { requestId: id },
        data: { requestTitle: helpRequest.title },
      });
    }

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
