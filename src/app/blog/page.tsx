'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowRight,
  ExternalLink,
  PlayCircle,
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

interface HelpfulVideo {
  id: string;
  title: string;
  category: string;
  channel: string;
  embedId: string;
  watchUrl: string;
  description: string;
  takeaway: string;
}

const helpfulVideos: HelpfulVideo[] = [
  {
    id: 'chosen-forgiveness',
    title: 'Forgiveness and grace in The Chosen',
    category: 'Faith And Hope',
    channel: 'The Chosen Brasil',
    embedId: 'fpIDvaco2pc',
    watchUrl: 'https://www.youtube.com/watch?v=fpIDvaco2pc',
    description:
      'A short clip from The Chosen that can encourage people who feel burdened, ashamed, or spiritually tired.',
    takeaway:
      'Faith-based encouragement can help people hold onto hope when life feels heavy.',
  },
  {
    id: 'chosen-healing',
    title: 'A powerful Chosen moment about healing and compassion',
    category: 'Faith And Hope',
    channel: 'YouTube clip',
    embedId: 'tKqG-gt-9g0',
    watchUrl: 'https://www.youtube.com/watch?v=tKqG-gt-9g0',
    description:
      'A simple reflective clip that speaks to mercy, restoration, and the value of every person.',
    takeaway:
      'Support is not only financial. Sometimes people need their spirit strengthened too.',
  },
  {
    id: 'no-money-business',
    title: 'How to start a business with no money',
    category: 'Starting From Nothing',
    channel: 'Simon Squibb',
    embedId: 'aQHH-rCg66M',
    watchUrl: 'https://www.youtube.com/watch?v=aQHH-rCg66M',
    description:
      'A practical entrepreneurship video focused on beginning small, taking action, and using what is already in your hands.',
    takeaway:
      'For requesters trying to rebuild, a simple business idea can become the start of longer-term stability.',
  },
  {
    id: 'small-business-action',
    title: 'A practical video about turning an idea into income',
    category: 'Starting From Nothing',
    channel: 'Simon Squibb',
    embedId: 'KppuCCVwy-s',
    watchUrl: 'https://www.youtube.com/watch?v=KppuCCVwy-s',
    description:
      'Focused on starting where you are, validating an idea quickly, and building confidence through action.',
    takeaway:
      'Small beginnings matter, especially when someone is trying to create a way forward with limited resources.',
  },
  {
    id: 'mindset-shift',
    title: 'A mindset and rebuilding video for hard seasons',
    category: 'Resilience',
    channel: 'Motivational YouTube',
    embedId: '2Dt-uARmpK8',
    watchUrl: 'https://www.youtube.com/watch?v=2Dt-uARmpK8',
    description:
      'A video meant to help viewers think about discipline, rebuilding, and not giving up in difficult circumstances.',
    takeaway:
      'People facing crisis often need both practical help and a reason to keep moving forward.',
  },
];

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(helpfulVideos[0].id);

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

  const activeVideo =
    helpfulVideos.find((video) => video.id === activeVideoId) || helpfulVideos[0];
  const spotlightPosts = posts.slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef6f1_0%,#f8fafc_34%,#ffffff_100%)] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-600">Helpful Video Hub</p>
              <h1 className="mt-3 text-4xl font-bold text-gray-900 md:text-5xl">
                Encouragement, business ideas, and practical hope
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                This page now focuses on useful videos people can actually watch. Some strengthen faith, some help with
                mindset, and some speak about building something when money is short.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                Faith and encouragement
              </div>
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Practical business ideas
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

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft">
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.embedId}`}
                title={activeVideo.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
              <div>
                <div className="inline-flex rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary-700">
                  {activeVideo.category}
                </div>
                <h2 className="mt-4 text-3xl font-bold text-gray-900">{activeVideo.title}</h2>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                  {activeVideo.channel}
                </p>
                <p className="mt-5 text-base leading-8 text-gray-700">{activeVideo.description}</p>
              </div>

              <div className="rounded-[1.5rem] bg-[#f5f8f6] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">Why It Helps</p>
                <p className="mt-3 text-sm leading-7 text-gray-700">{activeVideo.takeaway}</p>
                <a
                  href={activeVideo.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  Watch on YouTube
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-white p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-600">Playlist</p>
              <div className="mt-5 space-y-3">
                {helpfulVideos.map((video) => {
                  const isActive = video.id === activeVideo.id;

                  return (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideoId(video.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? 'border-primary-200 bg-primary-50'
                          : 'border-gray-100 bg-gray-50 hover:border-primary-100 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-2 ${isActive ? 'bg-primary-600 text-white' : 'bg-white text-primary-600'}`}>
                          <PlayCircle className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                            {video.category}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">{video.title}</p>
                          <p className="mt-1 text-xs text-gray-500">{video.channel}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Who This Is For</p>
              <p className="mt-3 text-sm leading-7 text-emerald-900">
                People going through hardship, families needing encouragement, and anyone looking for practical ideas to rebuild with dignity.
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
                If someone would rather read than watch, they can still explore trusted stories and articles below.
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
                    {post.isExternal ? <ExternalLink className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
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
