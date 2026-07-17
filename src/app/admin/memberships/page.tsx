'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, Loader2 } from 'lucide-react';

export default function AdminMembershipsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch('/api/admin/memberships').then((r) => r.json()).then(setData); }, []);
  if (!data) return <main className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></main>;
  return <main className="min-h-screen bg-gray-50 px-4 py-10"><div className="mx-auto max-w-7xl"><Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-primary-700"><ArrowLeft className="h-4 w-4" />Admin</Link><div className="mt-5 flex items-center gap-3"><Crown className="h-9 w-9 text-amber-600" /><div><h1 className="text-3xl font-black text-gray-950">Memberships</h1><p className="text-gray-600">Trials, active members, renewals and revenue.</p></div></div>
  <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">{[['Active', data.stats.active], ['Free trials', data.stats.trials], ['Expired', data.stats.expired], ['Payments', data.stats.payments], ['Revenue', `R${data.stats.revenue.toFixed(2)}`]].map(([label, value]) => <div key={label as string} className="rounded-2xl bg-white p-5 shadow-soft"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-black text-gray-950">{value}</p></div>)}</div>
  <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-soft"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-900 text-white"><tr><th className="p-4">Member</th><th className="p-4">Status</th><th className="p-4">Trial ends</th><th className="p-4">Paid through</th><th className="p-4">Total paid</th></tr></thead><tbody>{data.users.map((user: any) => <tr key={user.id} className="border-b border-gray-100"><td className="p-4"><p className="font-bold text-gray-900">{user.fullName}</p><p className="text-gray-500">{user.email}</p></td><td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : user.status === 'TRIAL' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'}`}>{user.status}</span></td><td className="p-4 text-gray-700">{user.membershipTrialEndsAt ? new Date(user.membershipTrialEndsAt).toLocaleDateString() : '—'}</td><td className="p-4 text-gray-700">{user.membershipExpiresAt ? new Date(user.membershipExpiresAt).toLocaleDateString() : '—'}</td><td className="p-4 font-bold">R{user.paid.toFixed(2)}</td></tr>)}</tbody></table></div></div></main>;
}
