'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CheckCircle2, Clock3, Crown, Loader2 } from 'lucide-react';

export default function MembershipCard({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch('/api/membership').then((r) => r.ok ? r.json() : null).then(setData); }, []);
  if (!data) return <div className="rounded-2xl border border-gray-200 bg-white p-5"><Loader2 className="h-5 w-5 animate-spin text-primary-600" /></div>;
  const active = data.active;
  const end = data.status === 'TRIAL' ? data.trialEndsAt : data.membershipExpiresAt;
  return <section className={`overflow-hidden rounded-2xl border ${active ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white' : 'border-amber-200 bg-gradient-to-br from-amber-50 to-white'} shadow-soft`}>
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3"><span className={`rounded-xl p-2.5 ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}><Crown className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-gray-500">MISHTEH membership</p><h2 className="mt-1 text-xl font-black text-gray-950">{data.status === 'ADMIN' ? 'Admin access' : data.status === 'ACTIVE' ? 'Active member' : data.status === 'TRIAL' ? 'Free trial active' : 'Membership renewal needed'}</h2></div></div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{active ? 'Active' : 'Expired'}</span>
      </div>
      {data.status !== 'ADMIN' && <><p className="mt-4 text-sm leading-6 text-gray-700">{active ? `${data.daysRemaining} day${data.daysRemaining === 1 ? '' : 's'} remaining. Your access includes donations, requests, conversations and consent-based contact sharing.` : 'Public browsing stays open. Renew to donate, post, comment, react, request help or ask to connect.'}</p>
      {end && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><CalendarDays className="h-4 w-4 text-primary-600" />{data.status === 'TRIAL' ? 'Trial ends' : 'Paid through'} {new Date(end).toLocaleDateString()}</p>}
      <Link href="/membership" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700"><Clock3 className="h-4 w-4" />{data.status === 'ACTIVE' ? 'Add another month' : data.status === 'TRIAL' ? 'View membership' : 'Renew for R10'}</Link></>}
    </div>
    {!compact && data.payments?.length > 0 && <div className="border-t border-gray-200/70 bg-white/70 px-5 py-4"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Recent payments</p>{data.payments.slice(0, 3).map((payment: any) => <div key={payment.id} className="flex items-center justify-between py-1.5 text-sm"><span className="flex items-center gap-2 text-gray-700"><CheckCircle2 className={`h-4 w-4 ${payment.status === 'COMPLETED' ? 'text-emerald-600' : 'text-gray-400'}`} />{new Date(payment.createdAt).toLocaleDateString()}</span><span className="font-bold text-gray-900">R{payment.amount.toFixed(2)} · {payment.status.toLowerCase()}</span></div>)}</div>}
  </section>;
}
