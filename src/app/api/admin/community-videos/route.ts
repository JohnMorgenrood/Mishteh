import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractYouTubeId } from '@/lib/youtube';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [videos, suggestions] = await Promise.all([
    prisma.communityVideo.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.videoSuggestion.findMany({ include: { user: { select: { fullName: true, email: true } } }, orderBy: { createdAt: 'desc' } }),
  ]);
  return NextResponse.json({ videos, suggestions });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const youtubeId = extractYouTubeId(String(body.youtubeUrl || ''));
  if (!youtubeId || !body.title?.trim() || !body.description?.trim() || !body.channelName?.trim()) {
    return NextResponse.json({ error: 'YouTube link, title, description, and channel are required.' }, { status: 400 });
  }
  const video = await prisma.communityVideo.create({ data: {
    youtubeId, title: body.title.trim(), description: body.description.trim(), channelName: body.channelName.trim(),
    published: Boolean(body.published), featured: Boolean(body.featured),
  }});
  if (body.suggestionId) await prisma.videoSuggestion.update({ where: { id: body.suggestionId }, data: { status: 'APPROVED' } });
  return NextResponse.json({ video }, { status: 201 });
}
