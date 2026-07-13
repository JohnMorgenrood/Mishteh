'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, LogIn, UserPlus, Home, HeartHandshake, PlaySquare, Bell, LayoutDashboard, UserCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [mobileAdminDropdownOpen, setMobileAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    };

    if (adminDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [adminDropdownOpen]);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image 
              src="/assets/logo.png" 
              alt="Mishteh Logo" 
              width={40} 
              height={40}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-2xl font-display font-bold gradient-text">MISHTEH</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              title="Home"
              aria-label="Home"
              className={`flex h-12 w-16 items-center justify-center rounded-xl transition-all ${
                isActive('/') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-primary-600'
              }`}
            >
              <Home className="h-6 w-6" /><span className="sr-only">Home</span>
            </Link>
            <Link
              href="/requests"
              title="Requests"
              aria-label="Requests"
              className={`flex h-12 w-16 items-center justify-center rounded-xl transition-all ${
                pathname?.startsWith('/requests') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-primary-600'
              }`}
            >
              <HeartHandshake className="h-6 w-6" /><span className="sr-only">Requests</span>
            </Link>
            <Link href="/community-videos" title="Community Videos" aria-label="Community Videos" className={`flex h-12 w-16 items-center justify-center rounded-xl transition-all ${isActive('/community-videos') ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100 hover:text-primary-600'}`}>
              <PlaySquare className="h-6 w-6" /><span className="sr-only">Community Videos</span>
            </Link>
            {status === 'authenticated' && <Link href="/activity" title="Activity" aria-label="Activity" className={`flex h-12 w-16 items-center justify-center rounded-xl transition-all ${isActive('/activity') ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100 hover:text-primary-600'}`}><Bell className="h-6 w-6" /><span className="sr-only">Activity</span></Link>}

            {status === 'authenticated' ? (
              <>
                <Link
                  href="/dashboard"
                  title="Dashboard"
                  aria-label="Dashboard"
                  className={`flex h-12 w-16 items-center justify-center rounded-xl transition-all ${
                    isActive('/dashboard') 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <LayoutDashboard className="h-6 w-6" /><span className="sr-only">Dashboard</span>
                </Link>
                
                <Link
                  href="/dashboard/profile"
                  title="Profile and settings"
                  aria-label="Profile and settings"
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                    isActive('/dashboard/profile') 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <UserCircle className="h-6 w-6" /><span className="sr-only">Profile and settings</span>
                </Link>
                
                {/* Admin Dropdown Menu */}
                {(session.user.userType === 'ADMIN' || ['mishteh144@gmail.com', 'golearnx@gmail.com'].includes(session.user.email || '')) && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                      className={`flex items-center gap-1 text-sm font-medium transition-all ${
                        pathname?.startsWith('/admin')
                          ? 'text-primary-600 font-semibold' 
                          : 'text-gray-700 hover:text-primary-600 hover:scale-105'
                      }`}
                    >
                      Admin
                      <ChevronDown className={`w-4 h-4 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu - Full Admin Access */}
                    {adminDropdownOpen && (
                      <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          🎛️ Control Center
                        </Link>
                        <Link
                          href="/admin/requests"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          📋 Manage Requests
                        </Link>
                        <Link href="/admin/videos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={() => setAdminDropdownOpen(false)}>
                          📺 Community Videos
                        </Link>
                        <Link
                          href="/admin/security"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          🔒 Security Monitor
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                                {/* Language Selector */}
                <LanguageSelector />
                                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">
                    {session.user.name}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 shadow-soft hover:shadow-soft-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <LanguageSelector />
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-all hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl shadow-soft hover:shadow-soft-lg hover:scale-105 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label={mobileMenuOpen ? 'Close account menu' : 'Open account menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation with Dropdown Animation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-gray-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="flex flex-col gap-3">
              {status === 'authenticated' ? (
                <>
                  <p className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Your account</p>
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/dashboard') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  <Link
                    href="/dashboard/profile"
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/dashboard/profile') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  {/* Admin Dropdown for Mobile - Full Access */}
                  {(session.user.userType === 'ADMIN' || ['mishteh144@gmail.com', 'golearnx@gmail.com'].includes(session.user.email || '')) && (
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <Link
                        href="/admin"
                        className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                          isActive('/admin') && !isActive('/admin/security') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        🎛️ Control Center
                      </Link>
                      <Link
                        href="/admin/requests"
                        className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                          isActive('/admin/requests') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        📋 Manage Requests
                      </Link>
                      <Link href="/admin/videos" className={`block px-4 py-2 text-sm rounded-md transition-colors ${isActive('/admin/videos') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>
                        📺 Community Videos
                      </Link>
                      <Link
                        href="/admin/security"
                        className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                          isActive('/admin/security') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        🔒 Security Monitor
                      </Link>
                    </div>
                  )}
                  
                  <div className="px-4 py-2 mt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2 font-medium">{session.user.name}</p>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-4 mt-2 border-t border-gray-200 flex flex-col gap-3">
                  <Link
                    href="/auth/login"
                    className="w-full px-4 py-3 text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="w-full px-4 py-3 text-sm font-semibold text-center text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg shadow-soft hover:shadow-soft-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
