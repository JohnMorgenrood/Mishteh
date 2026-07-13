import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { flagModerationIncident } from '@/lib/moderation-incident';

// PATCH - Verify or reject a document
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
    const { status, rejectionReason } = body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const existingDocument = await prisma.document.findUnique({ where: { id } });
    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
        verifiedBy: session.user.id,
      },
    });

    if (existingDocument.documentType === 'PROFILE_PHOTO') {
      if (status === 'VERIFIED') {
        await prisma.user.update({
          where: { id: existingDocument.userId },
          data: { image: `/api/profile-photo/${existingDocument.userId}` },
        });
      } else {
        await flagModerationIncident(
          existingDocument.userId,
          `Profile photo rejected: ${rejectionReason || 'unsafe or unsuitable image'}`
        );
      }
    }

    return NextResponse.json({
      message: `Document ${status.toLowerCase()} successfully`,
      document,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}
