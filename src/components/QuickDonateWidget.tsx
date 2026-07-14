'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, HandHeart, Loader2, MapPin, Sparkles, X } from 'lucide-react';

type QuickRequest = {
  id: string;
  title: string;
  location: string;
  targetAmount: number | string | null;
  currentAmount: number | string | null;
};

const money = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
});

export default function QuickDonateWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<QuickRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isHidden = pathname.startsWith('/admin') || pathname.startsWith('/auth');

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || loaded) return;

    const loadRequests = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/requests?limit=3');
        if (!response.ok) throw new Error('Could not load requests');
        const data = await response.json();
        setRequests(data.requests || []);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    };

    loadRequests();
  }, [isOpen, loaded]);

  if (isHidden) return null;

  return (
    <div className="md:hidden">
      {isOpen && (
        <button
          type="button"
          aria-label="Close quick donate panel"
          className="fixed inset-0 z-[55] bg-slate-950/30 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <section
          id="quick-donate-panel"
          aria-label="Quick donate"
          className="fixed bottom-24 left-4 right-4 z-[60] mx-auto max-w-sm overflow-hidden rounded-[1.75rem] border border-white/70 bg-[#fffaf4] shadow-[0_24px_70px_-20px_rgba(15,23,42,0.65)]"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 px-5 pb-5 pt-4 text-white">
            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-amber-300/25 blur-xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-900">
                  <Sparkles className="h-3 w-3" /> Make an impact
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">Who can we help today?</h2>
                <p className="mt-1 text-sm leading-5 text-blue-100">Choose an approved request and donate securely.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5 p-3.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-9 text-sm font-medium text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Finding requests...
              </div>
            ) : requests.length > 0 ? (
              requests.map((request) => {
                const target = Number(request.targetAmount || 0);
                const raised = Number(request.currentAmount || 0);
                const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

                return (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    onClick={() => setIsOpen(false)}
                    className="group block rounded-2xl border border-orange-100 bg-white p-3.5 shadow-sm transition active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{request.title}</p>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" /> {request.location}
                        </p>
                      </div>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                    {target > 0 && (
                      <div className="mt-3">
                        <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>{money.format(raised)} raised</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate-600">
                New approved requests will appear here soon.
              </div>
            )}

            <Link
              href="/requests"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
            >
              Browse all requests <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="quick-donate-panel"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border border-white/60 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-2.5 pl-3 pr-4 text-sm font-extrabold text-white shadow-[0_12px_35px_-10px_rgba(37,99,235,0.8)] transition active:scale-95"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-300 text-slate-900 shadow-inner">
            <HandHeart className="h-4.5 w-4.5" />
          </span>
          Donate
        </button>
      )}
    </div>
  );
}
