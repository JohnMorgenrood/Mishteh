import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireActiveMembership } from '@/lib/membership';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to react' }, { status: 401 });
  if (await requireActiveMembership(session.user.id, session.user.userType)) return NextResponse.json({ error: 'Active membership required.', membershipRequired: true }, { status: 402 });
  const { id } = await params;
  const existing = await prisma.communityPostReaction.findUnique({
    where: { postId_userId: { postId: id, userId: session.user.id } },
  });
  if (existing) {
    await prisma.communityPostReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.communityPostReaction.create({ data: { postId: id, userId: session.user.id, kind: 'HEART' } });
  }
  const reactionCount = await prisma.communityPostReaction.count({ where: { postId: id } });
  return NextResponse.json({ reacted: !existing, reactionCount });
}
