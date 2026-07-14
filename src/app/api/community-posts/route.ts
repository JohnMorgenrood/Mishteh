import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { moderateSupportiveContent } from '@/lib/content-moderation';

const starterPosts = [
  {
    slug: 'kindness-that-stayed-with-you',
    title: 'What is one act of kindness you still remember?',
    body: 'Sometimes a small gesture arrives at exactly the right moment. It could be a meal, a lift home, a patient conversation, or someone simply believing in you.',
    question: 'What did someone do for you, and why did it stay with you?',
    category: 'Conversation',
  },
  {
    slug: 'small-business-local-support',
    title: 'Which small local business deserves more support?',
    body: 'Local businesses create work, preserve skills, and hold communities together. A recommendation can introduce them to their next loyal customer.',
    question: 'Tell us who they are, what they do, and what makes them special. Please do not post private phone numbers.',
    category: 'Community',
  },
  {
    slug: 'one-hour-community-change',
    title: 'If you had one free hour to help, how would you use it?',
    body: 'Real change is often built from small, repeatable actions. Sharing an idea may help someone else find a way to contribute too.',
    question: 'Would you teach, deliver food, listen to someone, clean a shared space, or do something else?',
    category: 'Ideas',
  },
  {
    slug: 'good-news-community',
    title: 'Share one piece of good news from your week',
    body: 'Good news does not need to be enormous. Progress, recovery, a new opportunity, or a peaceful moment can give someone else hope.',
    question: 'What made you smile or feel hopeful this week?',
    category: 'Good News',
  },
];

async function ensureStarterPosts() {
  await prisma.communityPost.createMany({ data: starterPosts, skipDuplicates: true });
}

export async function GET() {
  try {
    await ensureStarterPosts();
    const session = await getServerSession(authOptions);
    const posts = await prisma.communityPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        comments: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, fullName: true, image: true } } },
        },
        reactions: { select: { userId: true, kind: true } },
      },
    });
    return NextResponse.json({
      posts: posts.map((post) => ({
        ...post,
        reactionCount: post.reactions.length,
        viewerReaction: post.reactions.find((reaction) => reaction.userId === session?.user?.id)?.kind || null,
        reactions: undefined,
      })),
    });
  } catch (error) {
    console.error('Community posts error:', error);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.userType !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const text = [body.title, body.body, body.question].filter(Boolean).join(' ');
  const moderation = moderateSupportiveContent(text);
  if (!moderation.allowed) return NextResponse.json({ error: moderation.reason }, { status: 422 });
  if (!body.title?.trim() || !body.body?.trim() || !body.question?.trim()) {
    return NextResponse.json({ error: 'Title, body, and question are required' }, { status: 400 });
  }
  const post = await prisma.communityPost.create({ data: {
    slug: `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`,
    title: body.title.trim(), body: body.body.trim(), question: body.question.trim(),
    category: body.category?.trim() || 'Community',
  }});
  return NextResponse.json({ post }, { status: 201 });
}
