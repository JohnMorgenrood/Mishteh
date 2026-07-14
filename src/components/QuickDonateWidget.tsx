'use client';

import { usePathname } from 'next/navigation';
import { HandHeart } from 'lucide-react';

export default function QuickDonateWidget() {
  const pathname = usePathname();
  const isRequestDetail = /^\/requests\/[^/]+\/?$/.test(pathname);

  if (!isRequestDetail) return null;

  const openDonationArea = () => {
    document.getElementById('support-this-request')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <button
      type="button"
      onClick={openDonationArea}
      aria-label="Donate to this request"
      className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border border-white/60 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-2.5 pl-3 pr-4 text-sm font-extrabold text-white shadow-[0_12px_35px_-10px_rgba(37,99,235,0.8)] transition active:scale-95 md:hidden"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-300 text-slate-900 shadow-inner">
        <HandHeart className="h-[18px] w-[18px]" />
      </span>
      Donate
    </button>
  );
}
