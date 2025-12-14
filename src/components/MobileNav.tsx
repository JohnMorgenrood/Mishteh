'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
    },
    {
      href: '/requests',
      icon: Search,
      label: 'Browse',
    },
    {
      href: session ? '/dashboard/requests/new' : '/auth/login',
      icon: PlusCircle,
      label: 'Create',
      isSpecial: true,
    },
    {
      href: '/activity',
      icon: Bell,
      label: 'Activity',
    },
    {
      href: session ? '/dashboard/profile' : '/auth/login',
      icon: User,
      label: 'Profile',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
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
