'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Heart, Loader2, MessageCircle, Send, Share2, ShieldCheck, Sparkles } from 'lucide-react';
import { formatShortDate } from '@/lib/utils';
import { getAvatarInitial, isUploadedProfileImage } from '@/lib/avatar';

type Comment = { id: string; content: string; createdAt: string; user: { id: string; fullName: string; image?: string | null } };
type Post = { id: string; title: string; body: string; question: string; category: string; createdAt: string; reactionCount: number; commentCount: number; conversationScore: number; viewerReaction: string | null; comments: Comment[] };

const accents = ['from-red-500 to-orange-500', 'from-gray-900 to-red-500', 'from-red-600 to-primary-500', 'from-gray-700 to-gray-900'];

export default function PostsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [weeklyTopic, setWeeklyTopic] = useState('kindness, community, and the ideas that bring us closer');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const loadPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/community-posts');
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts || []);
        if (data.weeklyTopic) setWeeklyTopic(data.weeklyTopic);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const react = async (postId: string) => {
    if (!session) { window.location.href = `/auth/login?callbackUrl=/activity`; return; }
    setBusy(`reaction-${postId}`);
    const response = await fetch(`/api/community-posts/${postId}/reaction`, { method: 'POST' });
    if (response.ok) {
      const data = await response.json();
      setPosts((current) => current.map((post) => post.id === postId ? { ...post, reactionCount: data.reactionCount, viewerReaction: data.reacted ? 'HEART' : null } : post));
    }
    setBusy(null);
  };

  const comment = async (event: FormEvent, postId: string) => {
    event.preventDefault();
    if (!session) { window.location.href = `/auth/login?callbackUrl=/activity`; return; }
    const content = drafts[postId]?.trim();
    if (!content) return;
    setBusy(`comment-${postId}`); setErrors((current) => ({ ...current, [postId]: '' }));
    const response = await fetch(`/api/community-posts/${postId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (response.ok) {
      setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: [data.comment, ...post.comments], commentCount: post.commentCount + 1, conversationScore: post.conversationScore + 3 } : post));
      setDrafts((current) => ({ ...current, [postId]: '' }));
    } else setErrors((current) => ({ ...current, [postId]: data.error || 'Could not post your comment' }));
    setBusy(null);
  };

  const share = async (post: Post) => {
    const url = `${window.location.origin}/activity#post-${post.id}`;
    if (navigator.share) await navigator.share({ title: post.title, text: post.question, url });
    else { await navigator.clipboard.writeText(url); setErrors((current) => ({ ...current, [post.id]: 'Link copied — ready to share.' })); }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-6 md:py-10">
      <div className="mx-auto max-w-3xl px-3 sm:px-6">
        <header className="mb-6 overflow-hidden rounded-[2rem] bg-gray-900 p-6 text-white shadow-xl md:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400"><Sparkles className="h-3.5 w-3.5" /> Updated every week</span>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-gray-400">This week’s discussion is about</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{weeklyTopic}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">We introduce a fresh topic each week, then move the conversation forward together. The most active discussions are shown first so thoughtful community exchanges are easy to find.</p>
        </header>

        {loading ? <div className="py-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-red-500" /></div> : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <article id={`post-${post.id}`} key={post.id} className="scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className={`h-2 bg-gradient-to-r ${accents[index % accents.length]}`} />
                <div className="p-5 md:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">{post.category}</span>
                    <div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{post.commentCount} replies</span><time className="text-xs text-slate-400">{formatShortDate(post.createdAt)}</time></div>
                  </div>
                  <h2 className="mt-4 text-xl font-extrabold leading-tight text-slate-900 md:text-2xl">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">{post.body}</p>
                  <div className="mt-5 rounded-2xl border-l-4 border-red-500 bg-gray-50 p-4 text-sm font-semibold leading-6 text-slate-800">{post.question}</div>

                  <div className="mt-5 flex items-center border-y border-slate-100 py-2">
                    <button onClick={() => react(post.id)} disabled={busy === `reaction-${post.id}`} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${post.viewerReaction ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Heart className={`h-5 w-5 ${post.viewerReaction ? 'fill-current' : ''}`} /> {post.reactionCount || ''} Like
                    </button>
                    <button onClick={() => { setExpandedComments((current) => ({ ...current, [post.id]: !current[post.id] })); document.getElementById(`comment-${post.id}`)?.focus(); }} aria-expanded={Boolean(expandedComments[post.id])} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"><MessageCircle className="h-5 w-5" /> {post.commentCount || ''} Comment</button>
                    <button onClick={() => share(post)} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"><Share2 className="h-5 w-5" /> Share</button>
                  </div>

                  <form onSubmit={(event) => comment(event, post.id)} className="mt-4 flex items-start gap-2">
                    <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-gray-900 to-red-600 text-xs font-bold text-white">
                      {isUploadedProfileImage(session?.user?.image) ? <Image src={session?.user?.image || ''} alt="Your profile" width={36} height={36} className="h-full w-full object-cover" /> : getAvatarInitial(session?.user?.name || 'Guest')}
                    </div>
                    <div className="flex min-w-0 flex-1 rounded-2xl bg-slate-100 p-1.5 pl-4 focus-within:ring-2 focus-within:ring-red-200">
                      <input id={`comment-${post.id}`} value={drafts[post.id] || ''} onChange={(event) => setDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={800} placeholder={session ? 'Write a kind comment...' : 'Sign in to join the conversation'} className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" />
                      <button type="submit" disabled={busy === `comment-${post.id}` || !drafts[post.id]?.trim()} aria-label="Post comment" className="grid h-9 w-9 place-items-center rounded-full bg-gray-900 text-white transition hover:bg-red-600 disabled:opacity-40"><Send className="h-4 w-4" /></button>
                    </div>
                  </form>
                  {errors[post.id] && <p className="ml-11 mt-2 text-xs font-medium text-red-600">{errors[post.id]} {errors[post.id].toLowerCase().includes('membership') && <a className="font-bold underline" href="/membership">Renew for R10</a>}</p>}

                  {post.comments.length > 0 && <div className="ml-0 mt-4 space-y-3 sm:ml-11">
                    {(expandedComments[post.id] ? post.comments : post.comments.slice(0, 2)).map((item) => <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex justify-between gap-3"><p className="text-sm font-bold text-slate-900">{item.user.fullName}</p><time className="text-[11px] text-slate-400">{formatShortDate(item.createdAt)}</time></div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.content}</p>
                    </div>)}
                    {post.comments.length > 2 && <button type="button" onClick={() => setExpandedComments((current) => ({ ...current, [post.id]: !current[post.id] }))} className="w-full rounded-xl py-2 text-sm font-bold text-red-600 transition hover:bg-red-50">{expandedComments[post.id] ? 'Show fewer comments' : `View the full conversation (${post.commentCount} comments)`}</button>}
                  </div>}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-500" /><p><strong className="text-gray-900">A safer community.</strong> Posts are published by MISHTEH and comments are checked automatically. Community post submissions will require admin approval before appearing.</p></div>
        {!session && <Link href="/auth/login?callbackUrl=/activity" className="mt-4 block rounded-2xl bg-slate-900 px-5 py-4 text-center text-sm font-bold text-white">Sign in to join the conversation</Link>}
      </div>
    </main>
  );
}
