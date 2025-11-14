'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'text-primary-600 font-semibold' 
                  : 'text-gray-700 hover:text-primary-600 hover:scale-105'
              }`}
            >
              Home
            </Link>
            <Link
              href="/requests"
              className={`text-sm font-medium transition-all ${
                isActive('/requests') 
                  ? 'text-primary-600 font-semibold' 
                  : 'text-gray-700 hover:text-primary-600 hover:scale-105'
              }`}
            >
              Requests
            </Link>
            <Link
              href="/blog"
              className={`text-sm font-medium transition-all ${
                isActive('/blog') 
                  ? 'text-primary-600 font-semibold' 
                  : 'text-gray-700 hover:text-primary-600 hover:scale-105'
              }`}
            >
              Blog
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-all ${
                isActive('/about') 
                  ? 'text-primary-600 font-semibold' 
                  : 'text-gray-700 hover:text-primary-600 hover:scale-105'
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-all ${
                isActive('/contact') 
                  ? 'text-primary-600 font-semibold' 
                  : 'text-gray-700 hover:text-primary-600 hover:scale-105'
              }`}
            >
              Contact
            </Link>

            {status === 'authenticated' ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-all ${
                    isActive('/dashboard') 
                      ? 'text-primary-600 font-semibold' 
                      : 'text-gray-700 hover:text-primary-600 hover:scale-105'
                  }`}
                >
                  Dashboard
                </Link>
                
                <Link
                  href="/dashboard/profile"
                  className={`text-sm font-medium transition-all ${
                    isActive('/dashboard/profile') 
                      ? 'text-primary-600 font-semibold' 
                      : 'text-gray-700 hover:text-primary-600 hover:scale-105'
                  }`}
                >
                  Profile
                </Link>
                
                {/* Admin Dropdown Menu */}
                {session.user.userType === 'ADMIN' && (
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
                    
                    {/* Dropdown Menu */}
                    {adminDropdownOpen && (
                      <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/admin/accounts"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          Accounts
                        </Link>
                        <Link
                          href="/admin/requests"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          Requests
                        </Link>
                        <Link
                          href="/admin/transactions"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          Transactions
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
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
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation with Dropdown Animation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/requests"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/requests') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Requests
              </Link>
              <Link
                href="/blog"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/blog') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/about"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/about') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/contact') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {status === 'authenticated' ? (
                <>
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
                  
                  {/* Admin Dropdown for Mobile */}
                  {session.user.userType === 'ADMIN' && (
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => setMobileAdminDropdownOpen(!mobileAdminDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <span>Admin Pages</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileAdminDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {mobileAdminDropdownOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          <Link
                            href="/admin"
                            className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                              isActive('/admin') ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileAdminDropdownOpen(false);
                            }}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/admin/accounts"
                            className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                              isActive('/admin/accounts') ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileAdminDropdownOpen(false);
                            }}
                          >
                            Accounts
                          </Link>
                          <Link
                            href="/admin/requests"
                            className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                              pathname?.startsWith('/admin/requests') ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileAdminDropdownOpen(false);
                            }}
                          >
                            Requests
                          </Link>
                          <Link
                            href="/admin/transactions"
                            className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                              pathname?.startsWith('/admin/transactions') ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileAdminDropdownOpen(false);
                            }}
                          >
                            Transactions
                          </Link>
                        </div>
                      )}
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
