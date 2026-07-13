'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HandHeart, PlusCircle, MessageSquareText, PlaySquare, LucideIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems: NavItem[] = [
    { href: session ? '/dashboard/requests/new' : '/auth/login', icon: PlusCircle, label: 'Request' },
    { href: '/requests', icon: HandHeart, label: 'Donate' },
    { href: '/activity', icon: MessageSquareText, label: 'Posts' },
    { href: '/community-videos', icon: PlaySquare, label: 'Videos' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-colors ${
                active
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-primary-600'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
