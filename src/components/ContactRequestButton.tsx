'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, X } from 'lucide-react';

export default function ContactRequestButton({ recipientId, requestId }: { recipientId: string; requestId: string }) {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true); setNotice('');
    const response = await fetch('/api/contact-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId, requestId, message }) });
    const data = await response.json();
    if (response.status === 402) setNotice('Membership required');
    else if (response.ok) { setNotice(data.message); setMessage(''); }
    else setNotice(data.error || 'Unable to send request.');
    setBusy(false);
  };
  return <div className="mt-4">
    <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm font-bold text-secondary-800 hover:bg-secondary-50"><MessageCircle className="h-4 w-4" /> Request contact details</button>
    {open && <div className="mt-3 rounded-2xl border border-secondary-100 bg-white p-4 shadow-lg"><div className="flex items-center justify-between"><p className="font-bold text-gray-900">Ask privately</p><button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button></div><p className="mt-1 text-xs leading-5 text-gray-600">Explain why you would like their number. Nothing is shared unless they approve.</p><textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={3} placeholder="Hi, I’d like to discuss…" className="mt-3 w-full rounded-xl border p-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100" /><button onClick={send} disabled={busy || message.trim().length < 10} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Send className="h-4 w-4" /> Send request</button>{notice && <p className="mt-2 text-sm font-medium text-gray-700">{notice === 'Membership required' ? <Link href="/membership" className="text-primary-700 underline">Activate membership to send this request.</Link> : notice}</p>}</div>}
  </div>;
}
