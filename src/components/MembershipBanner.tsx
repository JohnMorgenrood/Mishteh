'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function MembershipBanner() {
  const { status: authStatus } = useSession();
  const [membership, setMembership] = useState<any>(null);
  useEffect(() => { if (authStatus === 'authenticated') fetch('/api/membership').then((r) => r.json()).then(setMembership); }, [authStatus]);
  if (!membership || membership.status === 'ADMIN' || membership.status === 'ACTIVE') return null;
  return <div className={`px-4 py-2 text-center text-xs font-bold ${membership.active ? 'bg-blue-50 text-blue-900' : 'bg-amber-100 text-amber-950'}`}>
    {membership.status === 'TRIAL' ? `Free trial: ${membership.daysRemaining} day${membership.daysRemaining === 1 ? '' : 's'} left.` : 'Your free trial has ended.'} <Link href="/membership" className="ml-1 underline">{membership.active ? 'View membership' : 'Activate for R10/month'}</Link>
  </div>;
}
