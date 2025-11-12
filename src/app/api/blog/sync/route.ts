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
    url: 'https://www.premiumtimesng.com/category/faith/feed',
    category: 'Africa Faith',
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

    // Delete ALL external posts to force fresh sync
    const deleted = await prisma.blogPost.deleteMany({
      where: {
        isExternal: true,
      },
    });

    console.log(`Deleted ${deleted.count} external posts for fresh sync`);

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
            // Try to extract image from RSS content only - NO placeholders
            let imageUrl = item.enclosure?.url || null;
            
            if (!imageUrl && item.content) {
              const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/);
              if (imgMatch) {
                // Validate it's a real image URL, not a broken one
                const extractedUrl = imgMatch[1];
                if (extractedUrl.startsWith('http') && !extractedUrl.includes('534687')) {
                  imageUrl = extractedUrl;
                }
              }
            }

            // Clean up excerpt - remove ALL HTML tags, schema markup, and excess whitespace
            let cleanExcerpt = (item.contentSnippet || item.content || item.title || '')
              .replace(/<span[^>]*>.*?<\/span>/gi, '') // Remove span tags with content
              .replace(/<[^>]*>/g, '') // Remove all HTML tags
              .replace(/&[#a-z0-9]+;/gi, '') // Remove HTML entities like &#039;
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
            
            // If excerpt is too short or still has junk, use just the title
            if (cleanExcerpt.length < 20 || cleanExcerpt.includes('property=') || cleanExcerpt.includes('resource=')) {
              cleanExcerpt = item.title.substring(0, 300);
            } else {
              cleanExcerpt = cleanExcerpt.substring(0, 300);
            }

            await prisma.blogPost.create({
              data: {
                title: item.title.substring(0, 200),
                slug,
                excerpt: cleanExcerpt,
                content: item.content || item.contentSnippet || item.title,
                author: item.creator || 'External Source',
                category: feed.category,
                imageUrl,
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
