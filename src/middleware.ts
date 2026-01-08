import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// SECURITY: Only this email can access admin pages
const OWNER_EMAIL = 'mishteh144@gmail.com';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');
  const isAdminBlog = request.nextUrl.pathname.startsWith('/admin/blog');
  const isAdminSecurity = request.nextUrl.pathname.startsWith('/admin/security');

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    // Only redirect owner to admin blog, everyone else to dashboard
    if (token.email === OWNER_EMAIL) {
      return NextResponse.redirect(new URL('/admin/blog', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if ((isDashboard || isAdmin) && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // SECURITY: Only owner can access admin pages
  if (isAdmin && token) {
    // If not the owner, redirect to dashboard
    if (token.email !== OWNER_EMAIL) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Owner can access /admin/blog and /admin/security only
    if (!isAdminBlog && !isAdminSecurity) {
      return NextResponse.redirect(new URL('/admin/blog', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*', '/dashboard/:path*', '/admin/:path*'],
};
