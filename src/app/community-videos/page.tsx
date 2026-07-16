'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Youtube, ThumbsUp, PartyPopper, Loader2 } from 'lucide-react';

export default function CommunityVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [suggestion, setSuggestion] = useState({ youtubeUrl: '', message: '' });
  const [notice, setNotice] = useState('');
  const [commentNotices, setCommentNotices] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch('/api/community-videos');
    if (response.ok) setVideos((await response.json()).videos || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const react = async (id: string, type: 'LIKE' | 'LOVE' | 'CELEBRATE') => {
    const response = await fetch(`/api/community-videos/${id}/reaction`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }),
    });
    if (response.ok) load(); else setNotice((await response.json()).error || 'Unable to react.');
  };
  const comment = async (event: FormEvent, id: string) => {
    event.preventDefault();
    setSubmittingComment(id);
    setCommentNotices((value) => { const next = { ...value }; delete next[id]; return next; });
    try {
      const response = await fetch(`/api/community-videos/${id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: comments[id] }),
      });
      const data = await response.json();
      setCommentNotices((value) => ({ ...value, [id]: { type: response.ok ? 'success' : 'error', text: data.message || data.error || 'Unable to post comment.' } }));
      if (response.ok) setComments((value) => ({ ...value, [id]: '' }));
    } catch {
      setCommentNotices((value) => ({ ...value, [id]: { type: 'error', text: 'Unable to post your comment. Please check your connection and try again.' } }));
    } finally {
      setSubmittingComment(null);
    }
  };
  const suggest = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/community-videos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(suggestion),
    });
    const data = await response.json();
    setNotice(data.message || data.error);
    if (response.ok) setSuggestion({ youtubeUrl: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <section className="rounded-3xl bg-gray-900 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-400">Curated by MISHTEH</p>
          <h1 className="mt-3 text-4xl font-bold">Community Videos</h1>
          <p className="mt-3 max-w-2xl text-gray-300">Watch trusted creators helping people. MISHTEH reviews every video before it appears here.</p>
        </section>
        {notice && <div className="my-5 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-800">{notice}</div>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <main className="space-y-8">
            {loading ? <p>Loading videos…</p> : videos.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-soft"><Youtube className="mx-auto h-12 w-12 text-red-500" /><p className="mt-4 text-gray-600">No videos have been published yet.</p></div>
            ) : videos.map((video) => (
              <article key={video.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                <iframe className="aspect-video w-full bg-black" src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`} title={video.title} allowFullScreen />
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-red-600">{video.channelName}</p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">{video.title}</h2>
                  <p className="mt-3 text-gray-600">{video.description}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-y py-3 text-sm text-gray-600">
                    <button onClick={() => react(video.id, 'LIKE')} className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition hover:bg-blue-50 hover:text-blue-600 ${video.reactions?.[0]?.type === 'LIKE' ? 'bg-blue-50 text-blue-600' : ''}`}><ThumbsUp className="h-4 w-4" fill={video.reactions?.[0]?.type === 'LIKE' ? 'currentColor' : 'none'} /> Like <span className="text-xs">{video.reactionCounts?.LIKE || 0}</span></button>
                    <button onClick={() => react(video.id, 'LOVE')} className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition hover:bg-red-50 hover:text-red-600 ${video.reactions?.[0]?.type === 'LOVE' ? 'bg-red-50 text-red-600' : ''}`}><Heart className="h-4 w-4" fill={video.reactions?.[0]?.type === 'LOVE' ? 'currentColor' : 'none'} /> Love <span className="text-xs">{video.reactionCounts?.LOVE || 0}</span></button>
                    <button onClick={() => react(video.id, 'CELEBRATE')} className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition hover:bg-amber-50 hover:text-amber-600 ${video.reactions?.[0]?.type === 'CELEBRATE' ? 'bg-amber-50 text-amber-600' : ''}`}><PartyPopper className="h-4 w-4" /> Celebrate <span className="text-xs">{video.reactionCounts?.CELEBRATE || 0}</span></button>
                    <span className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> {video._count.comments}</span>
                    <Link href="/requests" className="ml-auto font-semibold text-primary-600">Support a request</Link>
                  </div>
                  <form onSubmit={(event) => comment(event, video.id)} className="mt-4 flex gap-2">
                    <input value={comments[video.id] || ''} onChange={(event) => setComments((value) => ({ ...value, [video.id]: event.target.value }))} placeholder="Write a respectful comment…" className="flex-1 rounded-xl border px-4 py-2" required />
                    <button disabled={submittingComment === video.id} aria-label="Post comment" className="rounded-xl bg-primary-600 px-4 text-white transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60">{submittingComment === video.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
                  </form>
                  {commentNotices[video.id] && <p role="status" className={`mt-2 rounded-xl px-3 py-2 text-sm ${commentNotices[video.id].type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{commentNotices[video.id].text}</p>}
                  <div className="mt-4 space-y-3">
                    {video.comments.map((item: any) => <div key={item.id} className={`rounded-xl p-3 ${item.approved ? 'bg-gray-50' : 'border border-amber-200 bg-amber-50'}`}><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{item.user.fullName}</p>{!item.approved && <span className="text-xs font-semibold text-amber-700">Awaiting approval</span>}</div><p className="mt-1 text-sm text-gray-600">{item.content}</p></div>)}
                  </div>
                </div>
              </article>
            ))}
          </main>

          <aside>
            <form onSubmit={suggest} className="sticky top-24 rounded-2xl bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold">Suggest a Video</h2>
              <p className="mt-2 text-sm text-gray-600">Send a YouTube link privately. Only admins can publish it.</p>
              <input type="url" value={suggestion.youtubeUrl} onChange={(e) => setSuggestion({ ...suggestion, youtubeUrl: e.target.value })} placeholder="YouTube link" className="mt-5 w-full rounded-xl border px-4 py-3" required />
              <textarea value={suggestion.message} onChange={(e) => setSuggestion({ ...suggestion, message: e.target.value })} placeholder="Why should we feature it?" rows={5} className="mt-3 w-full rounded-xl border px-4 py-3" required />
              <button className="mt-3 w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white">Send to MISHTEH</button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
