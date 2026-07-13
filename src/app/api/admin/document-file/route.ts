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
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });

  const document = await prisma.document.findUnique({ where: { id }, select: { filePath: true } });
  if (!document) return new NextResponse('Not found', { status: 404 });
  if (!document.filePath.includes('.private.blob.vercel-storage.com')) {
    return NextResponse.redirect(new URL(document.filePath, request.url));
  }

  const pathname = new URL(document.filePath).pathname.replace(/^\//, '');
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
