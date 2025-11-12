import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Parser from 'rss-parser';

const parser = new Parser();

// Christian news RSS feeds
const RSS_FEEDS = [
  {
    url: 'https://www.christianitytoday.com/ct/rss/index.rss',
    category: 'Christian News',
  },
  {
    url: 'https://www1.cbn.com/rss-cbn-articles-cbnnews.xml',
    category: 'Faith & Culture',
  },
  {
    url: 'https://www.jpost.com/rss/rssfeedsheadlines.aspx',
    category: 'Israel News',
  },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can trigger news fetch
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let totalAdded = 0;

    for (const feed of RSS_FEEDS) {
      try {
        const feedData = await parser.parseURL(feed.url);
        
        for (const item of feedData.items.slice(0, 5)) { // Get latest 5 from each feed
          if (!item.title || !item.link) continue;

          const slug = item.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .substring(0, 100);

          // Check if already exists
          const existing = await prisma.blogPost.findUnique({
            where: { slug },
          });

          if (!existing) {
            await prisma.blogPost.create({
              data: {
                title: item.title.substring(0, 200),
                slug,
                excerpt: (item.contentSnippet || item.content || '').substring(0, 300),
                content: item.content || item.contentSnippet || item.title,
                author: item.creator || 'External Source',
                category: feed.category,
                imageUrl: item.enclosure?.url || null,
                sourceUrl: item.link,
                isExternal: true,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
              },
            });
            totalAdded++;
          }
        }
      } catch (feedError) {
        console.error(`Error fetching feed ${feed.url}:`, feedError);
      }
    }

    return NextResponse.json({
      message: `Successfully added ${totalAdded} new blog posts`,
      totalAdded,
    });
  } catch (error: any) {
    console.error('Blog sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync blog posts' },
      { status: 500 }
    );
  }
}
