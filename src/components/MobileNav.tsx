'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Bell, User, LucideIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isSpecial?: boolean;
}

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userType = session?.user?.userType;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Build nav items based on user type
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
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
    ];

    // Middle action button - different based on user type
    let actionItem: NavItem;
    
    if (!session) {
      // Not logged in - show login
      actionItem = {
        href: '/auth/login',
        icon: User,
        label: 'Login',
        isSpecial: true,
      };
    } else if (userType !== 'ADMIN') {
      // Every community member may request help, including people who have donated.
      actionItem = {
        href: '/dashboard/requests/new',
        icon: PlusCircle,
        label: 'Request',
        isSpecial: true,
      };
    } else if (userType === 'ADMIN') {
      // Admin - show admin dashboard
      actionItem = {
        href: '/admin',
        icon: User,
        label: 'Admin',
        isSpecial: true,
      };
    } else {
      // Default fallback
      actionItem = {
        href: '/requests',
        icon: Search,
        label: 'Browse',
        isSpecial: true,
      };
    }

    const endItems: NavItem[] = [
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

    return [...baseItems, actionItem, ...endItems];
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isSpecial) {
            return (
              <Link
                key={`${item.href}-${index}`}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs mt-1 text-primary-600 font-medium">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={`${item.href}-${index}`}
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
