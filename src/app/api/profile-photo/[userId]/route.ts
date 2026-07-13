import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const photo = await prisma.document.findFirst({
    where: { userId, documentType: 'PROFILE_PHOTO', status: 'VERIFIED' },
    orderBy: { verifiedAt: 'desc' },
    select: { filePath: true },
  });
  if (!photo) return new NextResponse('Not found', { status: 404 });

  const pathname = new URL(photo.filePath).pathname.replace(/^\//, '');
  const result = await get(pathname, { access: 'private' });
  if (!result || result.statusCode !== 200) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
