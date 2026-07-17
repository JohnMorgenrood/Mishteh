'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function MembershipSuccessPage() {
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'done' | 'error'>('checking');
  useEffect(() => {
    const paymentId = new URLSearchParams(window.location.search).get('paymentId');
    if (!paymentId) { setState('error'); return; }
    fetch('/api/membership/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId }) })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then(() => { setState('done'); setTimeout(() => router.push('/dashboard'), 1800); })
      .catch(() => setState('error'));
  }, [router]);
  return <main className="grid min-h-screen place-items-center bg-gray-50 px-4"><div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">{state === 'checking' ? <><Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" /><h1 className="mt-5 text-2xl font-bold">Confirming membership…</h1></> : state === 'done' ? <><CheckCircle className="mx-auto h-14 w-14 text-green-600" /><h1 className="mt-5 text-2xl font-bold">Membership active</h1><p className="mt-2 text-gray-600">Thank you. Returning to your dashboard…</p></> : <><h1 className="text-2xl font-bold text-red-700">We could not confirm payment</h1><button onClick={() => router.push('/membership')} className="mt-5 rounded-xl bg-gray-900 px-5 py-3 font-bold text-white">Return to membership</button></>}</div></main>;
}
