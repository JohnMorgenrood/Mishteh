import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { moderateSupportiveContent } from '@/lib/content-moderation';
import { flagModerationIncident } from '@/lib/moderation-incident';
import { requireActiveMembership } from '@/lib/membership';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to comment.' }, { status: 401 });
  if (await requireActiveMembership(session.user.id, session.user.userType)) return NextResponse.json({ error: 'Active membership required.', membershipRequired: true }, { status: 402 });
  const account = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isSuspicious: true } });
  if (account?.isSuspicious) return NextResponse.json({ error: 'Your account is pending administrator review.' }, { status: 403 });
  const content = String((await request.json()).content || '').trim();
  if (content.length < 2 || content.length > 500) return NextResponse.json({ error: 'Comments must be 2–500 characters.' }, { status: 400 });
  const moderation = moderateSupportiveContent(content);
  if (!moderation.allowed) {
    await flagModerationIncident(session.user.id, moderation.reason);
    return NextResponse.json({ error: 'This comment was blocked and sent for review.' }, { status: 422 });
  }
  const { id } = await params;
  const video = await prisma.communityVideo.findFirst({ where: { id, published: true }, select: { id: true } });
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  await prisma.videoComment.create({ data: { videoId: id, userId: session.user.id, content, approved: false } });
  return NextResponse.json({ message: 'Comment sent for admin approval.' }, { status: 201 });
}
