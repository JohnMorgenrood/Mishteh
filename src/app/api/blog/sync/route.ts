import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Parser from 'rss-parser';

const parser = new Parser();

// RSS feeds for Christian news and humanitarian work
const RSS_FEEDS = [
  {
    url: 'https://www.christianitytoday.com/ct/rss/index.rss',
    category: 'Christian News',
    maxItems: 3,
  },
  {
    url: 'https://www1.cbn.com/rss-cbn-articles-cbnnews.xml',
    category: 'Faith & Culture',
    maxItems: 3,
  },
  {
    url: 'https://www.jpost.com/rss/rssfeedsheadlines.aspx',
    category: 'Israel News',
    maxItems: 3,
  },
  {
    url: 'https://www.worldvision.org/about-us/media-center/press-releases?format=feed&type=rss',
    category: 'World News',
    maxItems: 4,
  },
  {
    url: 'https://reliefweb.int/updates/rss.xml',
    category: 'World News',
    maxItems: 4,
  },
  {
    url: 'https://www.unicef.org/press-releases/rss.xml',
    category: 'World News',
    maxItems: 3,
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
    let totalProcessed = 0;
    const feedResults: any[] = [];

    // First, delete old external posts (keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deleted = await prisma.blogPost.deleteMany({
      where: {
        isExternal: true,
        publishedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`Deleted ${deleted.count} old posts`);

    for (const feed of RSS_FEEDS) {
      try {
        console.log(`Fetching feed: ${feed.url}`);
        const feedData = await parser.parseURL(feed.url);
        console.log(`Found ${feedData.items.length} items in feed`);
        
        let addedFromFeed = 0;
        
        for (const item of feedData.items.slice(0, feed.maxItems)) {
          totalProcessed++;
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
            addedFromFeed++;
            console.log(`Added: ${item.title}`);
          } else {
            console.log(`Skipped (exists): ${item.title}`);
          }
        }
        
        feedResults.push({
          url: feed.url,
          category: feed.category,
          added: addedFromFeed,
        });
      } catch (feedError) {
        console.error(`Error fetching feed ${feed.url}:`, feedError);
        feedResults.push({
          url: feed.url,
          error: String(feedError),
        });
      }
    }

    return NextResponse.json({
      message: `Successfully processed ${totalProcessed} articles, added ${totalAdded} new posts`,
      totalAdded,
      totalProcessed,
      deletedOld: deleted.count,
      feedResults,
    });
  } catch (error: any) {
    console.error('Blog sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync blog posts' },
      { status: 500 }
    );
  }
}
