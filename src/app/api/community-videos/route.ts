import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { moderateSupportiveContent } from '@/lib/content-moderation';
import { flagModerationIncident } from '@/lib/moderation-incident';
import { extractYouTubeId } from '@/lib/youtube';

export async function GET() {
  const session = await getServerSession(authOptions);
  const videos = await prisma.communityVideo.findMany({
    where: { published: true },
    include: {
      _count: { select: { reactions: true, comments: { where: { approved: true } } } },
      reactions: session?.user?.id ? { where: { userId: session.user.id }, select: { type: true } } : false,
      comments: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, content: true, createdAt: true, user: { select: { fullName: true, image: true } } },
      },
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ videos });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to suggest a video.' }, { status: 401 });
  const account = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isSuspicious: true } });
  if (account?.isSuspicious) return NextResponse.json({ error: 'Your account is pending administrator review.' }, { status: 403 });

  const body = await request.json();
  const youtubeUrl = typeof body.youtubeUrl === 'string' ? body.youtubeUrl.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!extractYouTubeId(youtubeUrl) || message.length < 10 || message.length > 500) {
    return NextResponse.json({ error: 'Enter a valid YouTube link and a message between 10 and 500 characters.' }, { status: 400 });
  }
  const moderation = moderateSupportiveContent(message);
  if (!moderation.allowed) {
    await flagModerationIncident(session.user.id, moderation.reason);
    return NextResponse.json({ error: 'This suggestion was blocked and sent for review.' }, { status: 422 });
  }
  await prisma.videoSuggestion.create({ data: { userId: session.user.id, youtubeUrl, message } });
  return NextResponse.json({ message: 'Thanks. Your suggestion was sent privately to the admins.' }, { status: 201 });
}
