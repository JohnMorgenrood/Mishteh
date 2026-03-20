'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Globe2,
  HeartHandshake,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  isExternal: boolean;
  publishedAt: string;
}

interface FeaturedStory {
  id: string;
  eyebrow: string;
  title: string;
  organisation: string;
  region: string;
  publishedAt: string;
  summary: string;
  impactLine: string;
  perspective: string;
  sourceUrl: string;
  sourceLabel: string;
  accentClasses: string;
}

const featuredStories: FeaturedStory[] = [
  {
    id: 'somalia',
    eyebrow: 'Food Assistance Under Pressure',
    title: 'Somalia is balancing drought recovery, displacement, and hunger risk at the same time.',
    organisation: 'World Food Programme',
    region: 'Somalia',
    publishedAt: 'March 11, 2026',
    summary:
      'WFP describes a fragile moment where families are trying to recover, but climate shocks, conflict, and funding strain still leave many households exposed to hunger.',
    impactLine:
      'This kind of story helps donors understand why steady support matters even when a crisis is no longer making daily headlines.',
    perspective:
      'In a feed format, this becomes less like a news archive and more like a window into what vulnerable families are still navigating right now.',
    sourceUrl: 'https://www.wfp.org/stories/somalia',
    sourceLabel: 'Read WFP story',
    accentClasses: 'from-amber-500 via-orange-500 to-rose-500',
  },
  {
    id: 'sudan',
    eyebrow: 'Child Nutrition Story',
    title: 'In Sudan, one sachet of therapeutic food can become the difference between decline and recovery.',
    organisation: 'UNICEF',
    region: 'Sudan',
    publishedAt: 'October 19, 2025',
    summary:
      'UNICEF tells the story through treatment and maternal hope, showing how severe malnutrition is experienced at family level rather than only through statistics.',
    impactLine:
      'This is the kind of post that makes the need personal, understandable, and difficult to scroll past without feeling something.',
    perspective:
      'Stories like this help Mishteh feel human and grounded, especially when paired with a clean full-screen layout and a trusted source link.',
    sourceUrl: 'https://www.unicef.org/stories/hope-red-sachet',
    sourceLabel: 'Read UNICEF story',
    accentClasses: 'from-red-500 via-rose-500 to-orange-400',
  },
  {
    id: 'gaza',
    eyebrow: 'Recovery Story',
    title: 'A child in Gaza regained strength through care and nutrition after acute malnutrition took hold.',
    organisation: 'UNICEF State of Palestine',
    region: 'Gaza',
    publishedAt: 'August 8, 2025',
    summary:
      'The story follows Oday’s recovery and shows how nutrition support, medical attention, and persistence can pull a child back from severe weakness.',
    impactLine:
      'This is exactly the kind of post that works well as a single-screen story card: focused, emotional, and rooted in one life.',
    perspective:
      'Using a reel-like layout gives stories like this the pause and dignity they deserve instead of burying them in a multi-column grid.',
    sourceUrl: 'https://www.unicef.org/sop/stories/oday-was-acutely-malnourished-and-weakbut-care-and-nutrition-revived-him',
    sourceLabel: 'Read UNICEF State of Palestine story',
    accentClasses: 'from-sky-500 via-cyan-500 to-emerald-400',
  },
  {
    id: 'haiti',
    eyebrow: 'Education And Hunger',
    title: 'In Haiti, hunger is not only about food. It also interrupts school, safety, and a child’s future.',
    organisation: 'UNICEF',
    region: 'Haiti',
    publishedAt: 'March 10, 2025',
    summary:
      'UNICEF’s reporting shows how violence, instability, and deprivation collide, leaving children and caregivers trying to protect both survival and learning.',
    impactLine:
      'A stronger blog feed can connect need, dignity, and long-term hope in one place instead of making every story feel like the same headline.',
    perspective:
      'This kind of slide broadens the feed beyond emergency relief and shows how poverty touches every part of a family’s life.',
    sourceUrl: 'https://www.unicef.org/stories/haiti-shleydine-strives-to-learn',
    sourceLabel: 'Read UNICEF story',
    accentClasses: 'from-indigo-500 via-blue-600 to-cyan-500',
  },
  {
    id: 'hotspots',
    eyebrow: 'Global Hunger Watch',
    title: 'A new WFP warning highlights multiple food-security hotspots where hunger could worsen quickly.',
    organisation: 'World Food Programme',
    region: 'Global',
    publishedAt: 'June 11, 2025',
    summary:
      'WFP and FAO warned that acute food insecurity could worsen across 13 hotspots because of conflict, displacement, and humanitarian funding shortfalls.',
    impactLine:
      'Ending the reel with a wider global view makes the page feel bigger than one article while still keeping each post focused and digestible.',
    perspective:
      'This is where Mishteh can feel modern: one strong post at a time, with a rhythm that keeps people moving through meaningful stories.',
    sourceUrl: 'https://www.wfp.org/videos/wfp-news-video-new-report-warns-escalating-hunger-due-conflict-displacement-and-humanitarian',
    sourceLabel: 'View WFP update',
    accentClasses: 'from-emerald-500 via-teal-500 to-sky-500',
  },
];

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const reelRef = useRef<HTMLDivElement | null>(null);
  const storyRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data: BlogPost[] = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncFeeds = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/blog/sync', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPosts();
      }
    } catch (error) {
      console.error('Error syncing feeds:', error);
    } finally {
      setSyncing(false);
    }
  };

  const scrollToStory = (index: number) => {
    const story = storyRefs.current[index];
    if (!story) return;

    story.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setActiveIndex(index);
  };

  const handleReelScroll = () => {
    const container = reelRef.current;
    if (!container) return;

    const containerTop = container.getBoundingClientRect().top;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    storyRefs.current.forEach((story, index) => {
      if (!story) return;
      const distance = Math.abs(story.getBoundingClientRect().top - containerTop);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  };

  const spotlightPosts = posts.slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600">Loading story reel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef6f1_0%,#f8fafc_28%,#ffffff_100%)] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-600">Story Reel</p>
              <h1 className="mt-3 text-4xl font-bold text-gray-900 md:text-5xl">
                One powerful hunger story at a time
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                The blog now feels more like a social story feed. Scroll through five full-screen stories about hunger,
                need, and relief work, then continue into extra reading below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                <HeartHandshake className="h-4 w-4" />
                Curated for impact
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Trusted source links
              </div>
              {session?.user?.userType === 'ADMIN' && (
                <button
                  onClick={syncFeeds}
                  disabled={syncing}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Blog Sources'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div
            ref={reelRef}
            onScroll={handleReelScroll}
            className="h-[78vh] snap-y snap-mandatory overflow-y-auto rounded-[2rem] pr-2"
          >
            <div className="space-y-6">
              {featuredStories.map((story, index) => (
                <article
                  key={story.id}
                  ref={(element) => {
                    storyRefs.current[index] = element;
                  }}
                  className="snap-start overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft"
                >
                  <div className="grid min-h-[78vh] grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className={`relative overflow-hidden bg-gradient-to-br ${story.accentClasses} p-8 text-white md:p-12`}>
                      <div className="absolute right-6 top-6 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
                        Story {index + 1} of {featuredStories.length}
                      </div>
                      <div className="absolute -right-10 bottom-[-20px] text-[180px] font-bold leading-none text-white/10 md:text-[220px]">
                        {index + 1}
                      </div>

                      <div className="relative z-10 flex h-full flex-col justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">{story.eyebrow}</p>
                          <h2 className="mt-5 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
                            {story.title}
                          </h2>
                          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/85">
                            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2">
                              {story.organisation}
                            </span>
                            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2">
                              {story.region}
                            </span>
                            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2">
                              {story.publishedAt}
                            </span>
                          </div>
                        </div>

                        <div className="mt-10 max-w-2xl rounded-[1.5rem] border border-white/20 bg-black/15 p-6 backdrop-blur-sm">
                          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/75">Why This Slide Matters</p>
                          <p className="mt-3 text-lg leading-8 text-white/95">{story.impactLine}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-8 md:p-10">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-600">
                          <Globe2 className="h-4 w-4" />
                          Source-backed context
                        </div>

                        <p className="mt-6 text-base leading-8 text-gray-700">{story.summary}</p>

                        <div className="mt-6 rounded-[1.5rem] bg-[#f5f8f6] p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">Feed Perspective</p>
                          <p className="mt-3 text-sm leading-7 text-gray-700">{story.perspective}</p>
                        </div>
                      </div>

                      <div className="mt-8 space-y-4">
                        <a
                          href={story.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                          {story.sourceLabel}
                          <ExternalLink className="h-4 w-4" />
                        </a>

                        <div className="flex items-center justify-between rounded-2xl border border-dashed border-gray-200 px-4 py-3 text-xs uppercase tracking-[0.22em] text-gray-500">
                          <span>Scroll for next story</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-white p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-600">Story Progress</p>
              <div className="mt-5 space-y-3">
                {featuredStories.map((story, index) => (
                  <button
                    key={story.id}
                    onClick={() => scrollToStory(index)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      activeIndex === index
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-100 bg-gray-50 hover:border-primary-100 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{story.region}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{story.eyebrow}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">What Changed</p>
              <p className="mt-3 text-sm leading-7 text-emerald-900">
                This page now behaves more like a story feed than a standard news archive, so each post gets more
                attention and feels worth reading.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-12 rounded-[2rem] bg-white p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-600">More Reading</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">Extra stories and updates</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">
                Your existing blog feed is still here below, but the top of the page now leads with a stronger
                full-screen story experience.
              </p>
            </div>
          </div>

          {spotlightPosts.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-gray-50 px-6 py-12 text-center text-gray-500">
              No extra blog posts are available yet.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {spotlightPosts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:border-primary-100 hover:bg-white">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
                    {post.isExternal ? <ExternalLink className="h-4 w-4" /> : <Globe2 className="h-4 w-4" />}
                    {post.category}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">{post.title}</h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-gray-600">{post.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-gray-400">
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    <span>{post.author}</span>
                  </div>
                  {post.isExternal ? (
                    <a
                      href={post.sourceUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Open source
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Read story
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
