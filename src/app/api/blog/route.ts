import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('Blog fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
