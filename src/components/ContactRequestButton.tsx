'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, X } from 'lucide-react';

function whatsappNumber(phone: string) { return phone.replace(/\D/g, '').replace(/^0/, '27'); }

export default function ContactRequestButton({ recipientId, requestId, phone, name }: { recipientId: string; requestId: string; phone?: string | null; name?: string }) {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true); setNotice('');
    const response = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId, requestId, message }) });
    const data = await response.json();
    if (response.ok) window.location.href = `/messages?conversation=${data.conversationId}`;
    else { setNotice(data.error || 'Unable to send message.'); setBusy(false); }
  };
  return <div className="mt-4">
    <div className="flex flex-wrap gap-2"><button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700"><MessageCircle className="h-4 w-4" /> Message {name || 'this person'}</button>{phone && <a href={`https://wa.me/${whatsappNumber(phone)}?text=${encodeURIComponent(`Hi ${name || ''}, I found your request on MISHTEH and would like to help.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"><MessageCircle className="h-4 w-4" /> WhatsApp · {phone}</a>}</div>
    {open && <div className="mt-3 rounded-2xl border border-primary-100 bg-white p-4 shadow-lg"><div className="flex items-center justify-between"><div><p className="font-bold text-gray-900">Start a private conversation</p><p className="mt-1 text-xs text-gray-600">They will receive this message in their MISHTEH inbox.</p></div><button onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4" /></button></div><textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={3} placeholder="Hi, I’d like to help with…" className="mt-3 w-full rounded-xl border p-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100" /><button onClick={send} disabled={busy || !message.trim()} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Send className="h-4 w-4" /> Send message</button>{notice && <p className="mt-2 text-sm font-medium text-red-700">{notice} {notice.toLowerCase().includes('membership') && <Link href="/membership" className="font-bold underline">Renew for R10</Link>}</p>}</div>}
  </div>;
}
