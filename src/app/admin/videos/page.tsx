'use client';

import { FormEvent, useEffect, useState } from 'react';

export default function AdminVideosPage() {
  const [data, setData] = useState<any>({ videos: [], suggestions: [], comments: [] });
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ youtubeUrl: '', title: '', description: '', channelName: '', published: true, featured: false, suggestionId: '' });
  const load = async () => { const response = await fetch('/api/admin/community-videos'); if (response.ok) setData(await response.json()); };
  useEffect(() => { load(); }, []);
  const create = async (event: FormEvent) => {
    event.preventDefault(); const response = await fetch('/api/admin/community-videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const result = await response.json(); setNotice(response.ok ? 'Video saved.' : result.error); if (response.ok) { setForm({ youtubeUrl: '', title: '', description: '', channelName: '', published: true, featured: false, suggestionId: '' }); load(); }
  };
  const toggle = async (video: any, field: 'published' | 'featured') => { await fetch(`/api/admin/community-videos/${video.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: !video[field] }) }); load(); };
  const reject = async (id: string) => { await fetch(`/api/admin/community-videos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'suggestion', status: 'REJECTED' }) }); load(); };
  const moderateComment = async (id: string, action: 'approve' | 'reject') => { await fetch(`/api/admin/community-videos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'comment', action }) }); load(); };
  const useSuggestion = (item: any) => setForm({ ...form, youtubeUrl: item.youtubeUrl, description: item.message, suggestionId: item.id });

  return <div className="min-h-screen bg-gray-100 p-6"><div className="mx-auto max-w-6xl space-y-8">
    <div><h1 className="text-3xl font-bold">Community Video Management</h1><p className="text-gray-600">Only published videos appear publicly.</p></div>
    {notice && <div className="rounded-xl bg-white p-4">{notice}</div>}
    <form onSubmit={create} className="grid gap-4 rounded-2xl bg-white p-6 shadow md:grid-cols-2">
      <input className="rounded-lg border p-3" placeholder="YouTube URL" value={form.youtubeUrl} onChange={e => setForm({...form, youtubeUrl:e.target.value})} required />
      <input className="rounded-lg border p-3" placeholder="Channel name" value={form.channelName} onChange={e => setForm({...form, channelName:e.target.value})} required />
      <input className="rounded-lg border p-3 md:col-span-2" placeholder="Video title" value={form.title} onChange={e => setForm({...form, title:e.target.value})} required />
      <textarea className="rounded-lg border p-3 md:col-span-2" placeholder="Why this video matters" value={form.description} onChange={e => setForm({...form, description:e.target.value})} required />
      <label><input type="checkbox" checked={form.published} onChange={e => setForm({...form,published:e.target.checked})} /> Publish now</label>
      <label><input type="checkbox" checked={form.featured} onChange={e => setForm({...form,featured:e.target.checked})} /> Feature first</label>
      <button className="rounded-xl bg-gray-900 p-3 font-semibold text-white md:col-span-2">Save Video</button>
    </form>
    <section className="rounded-2xl bg-white p-6"><h2 className="text-xl font-bold">Comments Awaiting Approval</h2><p className="mt-1 text-sm text-gray-600">Comments remain private until you approve them.</p><div className="mt-4 space-y-3">{data.comments.length === 0 ? <p className="text-sm text-gray-500">No comments are waiting.</p> : data.comments.map((comment:any)=><div key={comment.id} className="rounded-xl border p-4"><p className="font-semibold">{comment.user.fullName} <span className="font-normal text-gray-500">on {comment.video.title}</span></p><p className="mt-2 text-sm text-gray-700">{comment.content}</p><div className="mt-3 flex gap-3"><button onClick={()=>moderateComment(comment.id,'approve')} className="rounded bg-green-100 px-3 py-2 text-green-800">Approve</button><button onClick={()=>moderateComment(comment.id,'reject')} className="rounded bg-red-100 px-3 py-2 text-red-700">Delete</button></div></div>)}</div></section>
    <section className="rounded-2xl bg-white p-6"><h2 className="text-xl font-bold">Suggestions</h2><div className="mt-4 space-y-3">{data.suggestions.map((item:any)=><div key={item.id} className="rounded-xl border p-4"><p className="font-semibold">{item.user.fullName} — {item.status}</p><a href={item.youtubeUrl} target="_blank" className="text-primary-600">{item.youtubeUrl}</a><p className="mt-2 text-sm">{item.message}</p>{item.status==='PENDING'&&<div className="mt-3 flex gap-3"><button onClick={()=>useSuggestion(item)} className="rounded bg-primary-600 px-3 py-2 text-white">Use suggestion</button><button onClick={()=>reject(item.id)} className="rounded bg-red-100 px-3 py-2 text-red-700">Reject</button></div>}</div>)}</div></section>
    <section className="rounded-2xl bg-white p-6"><h2 className="text-xl font-bold">Published Library</h2><div className="mt-4 space-y-3">{data.videos.map((video:any)=><div key={video.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="font-semibold">{video.title}</p><p className="text-sm text-gray-500">{video.channelName}</p></div><div className="flex gap-2"><button onClick={()=>toggle(video,'published')} className="rounded bg-gray-100 px-3 py-2">{video.published?'Unpublish':'Publish'}</button><button onClick={()=>toggle(video,'featured')} className="rounded bg-gray-100 px-3 py-2">{video.featured?'Unfeature':'Feature'}</button></div></div>)}</div></section>
  </div></div>;
}
