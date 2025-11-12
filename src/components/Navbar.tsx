'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform" fill="currentColor" />
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
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">
                    {session.user.name}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 shadow-soft hover:shadow-soft-lg transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-all hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl shadow-soft hover:shadow-soft-lg hover:scale-105 transition-all"
                >
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/requests"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/requests') ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Requests
              </Link>
              <Link
                href="/blog"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/blog') ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/about"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/about') ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/contact') ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {status === 'authenticated' ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isActive('/dashboard') ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">{session.user.name}</p>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-2 border-t border-gray-200 flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    className="w-full px-4 py-2 text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="w-full px-4 py-2 text-sm font-medium text-center text-white bg-primary-600 rounded-md hover:bg-primary-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
