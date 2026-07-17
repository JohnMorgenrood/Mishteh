import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { moderateSupportiveContent } from '@/lib/content-moderation';
import { flagModerationIncident } from '@/lib/moderation-incident';
import { requireActiveMembership } from '@/lib/membership';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to comment' }, { status: 401 });
  if (await requireActiveMembership(session.user.id, session.user.userType)) return NextResponse.json({ error: 'Active membership required.', membershipRequired: true }, { status: 402 });
  const { id } = await params;
  const { content } = await request.json();
  if (typeof content !== 'string' || content.trim().length < 2 || content.trim().length > 800) {
    return NextResponse.json({ error: 'Comments must be between 2 and 800 characters' }, { status: 400 });
  }
  const moderation = moderateSupportiveContent(content);
  if (!moderation.allowed) {
    await flagModerationIncident(session.user.id, moderation.reason);
    return NextResponse.json({ error: moderation.reason }, { status: 422 });
  }
  const comment = await prisma.communityPostComment.create({
    data: { postId: id, userId: session.user.id, content: content.trim() },
    include: { user: { select: { id: true, fullName: true, image: true } } },
  });
  return NextResponse.json({ comment }, { status: 201 });
}
