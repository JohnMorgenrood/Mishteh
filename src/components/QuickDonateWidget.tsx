'use client';

import { usePathname } from 'next/navigation';
import { HandHeart } from 'lucide-react';

export default function QuickDonateWidget() {
  const pathname = usePathname();
  const isRequestDetail = /^\/requests\/[^/]+\/?$/.test(pathname);

  if (!isRequestDetail) return null;

  const openDonationArea = () => {
    const panel = document.getElementById('request-donation-panel') as HTMLDetailsElement | null;
    if (panel) panel.open = true;
    (panel || document.getElementById('support-this-request'))?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <button
      type="button"
      onClick={openDonationArea}
      aria-label="Donate to this request"
      className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900 py-2.5 pl-3 pr-4 text-sm font-extrabold text-white shadow-[0_14px_35px_-10px_rgba(17,24,39,0.85)] transition hover:bg-gray-800 active:scale-95 md:hidden"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white shadow-inner">
        <HandHeart className="h-[18px] w-[18px]" />
      </span>
      Donate
    </button>
  );
}
