import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// SECURITY: Only these emails can access admin pages
const OWNER_EMAILS = ['mishteh144@gmail.com', 'golearnx@gmail.com'];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    // Only redirect owners to admin, everyone else to dashboard
    if (OWNER_EMAILS.includes(token.email as string)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if ((isDashboard || isAdmin) && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // SECURITY: Only owners can access admin pages - FULL ACCESS
  if (isAdmin && token) {
    // If not an owner, redirect to dashboard
    if (!OWNER_EMAILS.includes(token.email as string)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Owners have FULL admin access - no restrictions
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/auth/:path*', '/dashboard/:path*', '/admin/:path*', '/activity/:path*', '/requests/:path*', '/profile/:path*'],
};
