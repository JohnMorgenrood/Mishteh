import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { moderateSupportiveContent } from '@/lib/content-moderation';
import { flagModerationIncident } from '@/lib/moderation-incident';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'You must be logged in.' }, { status: 401 });
    }

    const postingAccount = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isSuspicious: true },
    });
    if (postingAccount?.isSuspicious) {
      return NextResponse.json(
        { message: 'Your account is blocked from posting pending administrator review.' },
        { status: 403 }
      );
    }

    const { id: requestId } = await params;
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (message.length < 20) {
      return NextResponse.json(
        { message: 'Please write a fuller thank-you message before posting.' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { message: 'Thank-you messages should stay under 500 characters.' },
        { status: 400 }
      );
    }

    const moderation = moderateSupportiveContent(message);
    if (!moderation.allowed) {
      await flagModerationIncident(session.user.id, moderation.reason);
      return NextResponse.json(
        { message: 'This content was blocked and your account was sent for administrator review.' },
        { status: 422 }
      );
    }

    const helpRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        donations: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!helpRequest) {
      return NextResponse.json({ message: 'Request not found.' }, { status: 404 });
    }

    if (helpRequest.userId !== session.user.id) {
      return NextResponse.json({ message: 'Only the requester can post this update.' }, { status: 403 });
    }

    if (helpRequest.donations.length === 0) {
      return NextResponse.json(
        { message: 'A thank-you update can only be posted after support has been received.' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.request.update({
        where: { id: requestId },
        data: {
          gratitudeMessage: message,
          gratitudePostedAt: new Date(),
        },
      }),
      prisma.activity.deleteMany({
        where: {
          type: 'THANK_YOU',
          userId: session.user.id,
          requestId,
        },
      }),
      prisma.activity.create({
        data: {
          type: 'THANK_YOU',
          userId: session.user.id,
          requestId,
          metadata: JSON.stringify({
            userName: session.user.name || helpRequest.user.fullName,
            messagePreview: message.substring(0, 160),
          }),
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error posting gratitude update:', error);
    return NextResponse.json(
      { message: 'Failed to post your thank-you update.' },
      { status: 500 }
    );
  }
}
