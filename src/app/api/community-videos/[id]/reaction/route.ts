import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const REACTION_TYPES = ['LIKE', 'LOVE', 'CELEBRATE'] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to react.' }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const type = REACTION_TYPES.includes(body.type) ? body.type : 'LIKE';
  const video = await prisma.communityVideo.findFirst({ where: { id, published: true }, select: { id: true } });
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  const existing = await prisma.videoReaction.findUnique({ where: { videoId_userId: { videoId: id, userId: session.user.id } } });
  if (existing && existing.type === type) await prisma.videoReaction.delete({ where: { id: existing.id } });
  else if (existing) await prisma.videoReaction.update({ where: { id: existing.id }, data: { type } });
  else await prisma.videoReaction.create({ data: { videoId: id, userId: session.user.id, type } });
  return NextResponse.json({ reacted: existing?.type !== type, type });
}
