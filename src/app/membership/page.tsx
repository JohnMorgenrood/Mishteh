'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

export default function MembershipPage() {
  const [status, setStatus] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/membership').then((response) => response.json()).then(setStatus); }, []);
  const join = async () => {
    setBusy(true); setError('');
    const response = await fetch('/api/membership', { method: 'POST' });
    const data = await response.json();
    if (response.ok) window.location.href = data.checkoutUrl;
    else { setError(data.error || 'Unable to start checkout.'); setBusy(false); }
  };
  return <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
    <div className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-white bg-white shadow-2xl">
      <div className="bg-gray-900 p-7 text-white"><span className="inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-300"><Sparkles className="h-4 w-4" /> MISHTEH Membership</span><h1 className="mt-4 text-3xl font-bold">Community access for R10/month</h1><p className="mt-2 text-gray-300">New members receive seven days free. Renew manually each month—there are no automatic deductions.</p></div>
      <div className="p-7">
        <div className="mb-6 flex items-end gap-2"><span className="text-5xl font-black text-gray-900">R10</span><span className="pb-1 text-gray-600">per month</span></div>
        <ul className="space-y-3 text-sm text-gray-800">{['Donate and support requests', 'Create a reviewed help request', 'Join posts and video conversations', 'Request contact details with consent'].map((item) => <li key={item} className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-green-600" />{item}</li>)}</ul>
        {status?.status === 'TRIAL' && <p className="mt-6 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">Your free trial has {status.daysRemaining} day{status.daysRemaining === 1 ? '' : 's'} remaining.</p>}
        {status?.status === 'ACTIVE' && <p className="mt-6 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">Membership active until {new Date(status.membershipExpiresAt).toLocaleDateString()}.</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button onClick={join} disabled={busy || status?.status === 'ADMIN'} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3.5 font-bold text-white hover:bg-primary-700 disabled:opacity-50">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}{status?.status === 'ACTIVE' ? 'Add another month' : 'Continue with Yoco'}</button>
        <p className="mt-3 text-center text-xs text-gray-500">One-time R10 Yoco payment. Renew only when you choose. Public stories remain free to browse.</p>
        {status?.payments?.length > 0 && <div className="mt-6 border-t border-gray-200 pt-5"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Payment history</p>{status.payments.map((payment: any) => <div key={payment.id} className="flex justify-between border-b border-gray-100 py-2 text-sm text-gray-700"><span>{new Date(payment.createdAt).toLocaleDateString()}</span><span className="font-bold">R{payment.amount.toFixed(2)} · {payment.status.toLowerCase()}</span></div>)}</div>}
      </div>
    </div>
  </main>;
}
