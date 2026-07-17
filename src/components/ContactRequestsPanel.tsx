'use client';

import { useEffect, useState } from 'react';
import { Check, Phone, X } from 'lucide-react';

export default function ContactRequestsPanel() {
  const [data, setData] = useState<any>({ received: [], sent: [] });
  const load = () => fetch('/api/contact-requests').then((r) => r.json()).then(setData);
  useEffect(() => { load(); }, []);
  const respond = async (id: string, status: string) => { await fetch('/api/contact-requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); load(); };
  if (!data.received?.length && !data.sent?.length) return null;
  return <section id="contact-requests" className="mb-8 scroll-mt-24 rounded-2xl bg-white p-5 shadow-soft"><h2 className="text-lg font-bold text-gray-900">Private contact requests</h2><p className="mt-1 text-sm text-gray-600">You always control whether your phone number is shared.</p>
    {data.received?.length > 0 && <div className="mt-5"><h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">People asking you</h3><div className="mt-2 space-y-3">{data.received.map((item: any) => <div key={item.id} className="rounded-xl border p-4"><p className="font-bold text-gray-900">{item.requester.fullName}</p><p className="mt-1 text-sm text-gray-700">“{item.message}”</p>{item.status === 'PENDING' ? <div className="mt-3 flex gap-2"><button onClick={() => respond(item.id, 'APPROVED')} className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm font-bold text-green-800"><Check className="h-4 w-4" /> Approve</button><button onClick={() => respond(item.id, 'DECLINED')} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700"><X className="h-4 w-4" /> Decline</button></div> : <p className="mt-2 text-xs font-bold uppercase text-gray-500">{item.status}</p>}</div>)}</div></div>}
    {data.sent?.length > 0 && <div className="mt-5"><h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Your requests</h3><div className="mt-2 space-y-3">{data.sent.map((item: any) => <div key={item.id} className="rounded-xl bg-gray-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold text-gray-900">{item.recipient.fullName}</p><span className="text-xs font-bold text-gray-500">{item.status}</span></div>{item.status === 'APPROVED' && item.recipient.phone && <a href={`tel:${item.recipient.phone}`} className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-green-700"><Phone className="h-4 w-4" /> {item.recipient.phone}</a>}</div>)}</div></div>}
  </section>;
}
