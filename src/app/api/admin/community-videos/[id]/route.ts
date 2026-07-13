import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params; const body = await request.json();
  if (body.kind === 'suggestion') {
    const suggestion = await prisma.videoSuggestion.update({ where: { id }, data: { status: body.status, adminNotes: body.adminNotes || null } });
    return NextResponse.json({ suggestion });
  }
  if (body.kind === 'comment') {
    if (body.action === 'approve') {
      const comment = await prisma.videoComment.update({ where: { id }, data: { approved: true } });
      return NextResponse.json({ comment });
    }
    await prisma.videoComment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }
  const video = await prisma.communityVideo.update({ where: { id }, data: { published: body.published, featured: body.featured } });
  return NextResponse.json({ video });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params; await prisma.communityVideo.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
