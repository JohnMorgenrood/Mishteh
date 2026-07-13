import { get } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = request.nextUrl.searchParams.get('userId');
  const kind = request.nextUrl.searchParams.get('kind');
  if (!userId || !['id', 'selfie'].includes(kind || '')) {
    return NextResponse.json({ error: 'Invalid file request' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { idDocumentUrl: true, selfieUrl: true },
  });
  const fileUrl = kind === 'id' ? user?.idDocumentUrl : user?.selfieUrl;
  if (!fileUrl) return new NextResponse('Not found', { status: 404 });

  if (!fileUrl.includes('.private.blob.vercel-storage.com')) {
    return NextResponse.redirect(new URL(fileUrl, request.url));
  }

  const pathname = new URL(fileUrl).pathname.replace(/^\//, '');
  const result = await get(pathname, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}
