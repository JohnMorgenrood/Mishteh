'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Globe2,
  RefreshCw,
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
  mediaUrl: string;
  mediaAlt: string;
  mediaTag: string;
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
      'Steady support can help families hold on through drought, rising prices, and continued uncertainty.',
    perspective:
      'For families living through this, daily needs do not pause when headlines move on.',
    sourceUrl: 'https://www.wfp.org/stories/somalia',
    sourceLabel: 'Read WFP story',
    mediaUrl: 'https://images.unsplash.com/photo-1593113598332-cd59a93ad1b1?auto=format&fit=crop&w=1200&q=80',
    mediaAlt: 'Aid worker handing out food support',
    mediaTag: 'Photo story',
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
      'Stories like this remind us that early help can protect a child’s strength, health, and future.',
    perspective:
      'Behind every nutrition emergency is a parent trying to keep a child safe and alive.',
    sourceUrl: 'https://www.unicef.org/stories/hope-red-sachet',
    sourceLabel: 'Read UNICEF story',
    mediaUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    mediaAlt: 'Mother and child together outdoors',
    mediaTag: 'Human story',
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
      'The story follows Oday\'s recovery and shows how nutrition support, medical attention, and persistence can pull a child back from severe weakness.',
    impactLine:
      'Recovery is possible when care reaches children in time.',
    perspective:
      'For donors and requesters alike, this is a reminder that support can bring real strength back into a family\'s life.',
    sourceUrl: 'https://www.unicef.org/sop/stories/oday-was-acutely-malnourished-and-weakbut-care-and-nutrition-revived-him',
    sourceLabel: 'Read UNICEF State of Palestine story',
    mediaUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
    mediaAlt: 'Child receiving comfort and care',
    mediaTag: 'Recovery story',
    accentClasses: 'from-sky-500 via-cyan-500 to-emerald-400',
  },
  {
    id: 'haiti',
    eyebrow: 'Education And Hunger',
    title: 'In Haiti, hunger is not only about food. It also interrupts school, safety, and a child\'s future.',
    organisation: 'UNICEF',
    region: 'Haiti',
    publishedAt: 'March 10, 2025',
    summary:
      'UNICEF\'s reporting shows how violence, instability, and deprivation collide, leaving children and caregivers trying to protect both survival and learning.',
    impactLine:
      'Need affects more than food alone. It touches safety, education, dignity, and peace at home.',
    perspective:
      'When a family is under pressure, every part of daily life becomes harder to carry.',
    sourceUrl: 'https://www.unicef.org/stories/haiti-shleydine-strives-to-learn',
    sourceLabel: 'Read UNICEF story',
    mediaUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=80',
    mediaAlt: 'Children walking together near a school',
    mediaTag: 'Family pressure',
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
      'Large crises often begin with local shortages, displacement, and families running out of options.',
    perspective:
      'Global hunger warnings help communities understand that many families are carrying burdens far heavier than we can see at first glance.',
    sourceUrl: 'https://www.wfp.org/videos/wfp-news-video-new-report-warns-escalating-hunger-due-conflict-displacement-and-humanitarian',
    sourceLabel: 'View WFP update',
    mediaUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    mediaAlt: 'Children waiting together outdoors',
    mediaTag: 'Global update',
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
          <p className="mt-4 text-gray-600">Loading stories...</p>
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
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-600">Stories Of Need And Hope</p>
              <h1 className="mt-3 text-4xl font-bold text-gray-900 md:text-5xl">
                Real stories of hunger, hardship, and support
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                Explore trusted stories about families in need, relief efforts, and the realities many communities are facing around the world.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                Real-world stories of need
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
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
                  <div className="grid min-h-[78vh] grid-cols-1 lg:grid-cols-[1fr_1fr]">
                    <div className={`relative overflow-hidden bg-gradient-to-br ${story.accentClasses} p-7 text-white md:p-10`}>
                      <div className="absolute right-6 top-6 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
                        Story {index + 1} of {featuredStories.length}
                      </div>
                      <div className="absolute -right-10 bottom-[-20px] text-[120px] font-bold leading-none text-white/10 md:text-[160px]">
                        {index + 1}
                      </div>

                      <div className="relative z-10 flex h-full flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80 md:text-sm">{story.eyebrow}</p>
                          <h2 className="mt-4 max-w-2xl text-2xl font-bold leading-tight md:text-[2.4rem]">
                            {story.title}
                          </h2>
                          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/85 md:text-sm">
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

                        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                          <div className="max-w-xl rounded-[1.5rem] border border-white/20 bg-black/15 p-5 backdrop-blur-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/75">Why This Matters</p>
                            <p className="mt-3 text-base leading-7 text-white/95 md:text-lg">{story.impactLine}</p>
                          </div>
                          <div className="overflow-hidden rounded-[1.5rem] border border-white/20 bg-black/20 shadow-lg">
                            <div className="relative h-48 md:h-56">
                              <img
                                src={story.mediaUrl}
                                alt={story.mediaAlt}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-900">
                                {story.mediaTag}
                              </div>
                              <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-sm font-semibold text-white">{story.region}</p>
                                <p className="mt-1 text-xs text-white/85">{story.mediaAlt}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-8 md:p-10">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-600">
                          <Globe2 className="h-4 w-4" />
                          Trusted source
                        </div>

                        <p className="mt-6 text-base leading-8 text-gray-700 md:text-[1.05rem]">{story.summary}</p>

                        <div className="mt-6 rounded-[1.5rem] bg-[#f5f8f6] p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">What This Shows</p>
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
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Why These Stories Matter</p>
              <p className="mt-3 text-sm leading-7 text-emerald-900">
                These stories reflect many kinds of hardship, including hunger, medical emergencies, children at risk, family crisis, and urgent human need.
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
                Continue reading trusted updates and related stories below.
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
