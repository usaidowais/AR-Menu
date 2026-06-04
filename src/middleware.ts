import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Condition 3: Explicitly ALLOW all traffic to /menu/* and /api/*
  if (pathname.startsWith('/menu') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Read authentication cookie/session
  const allCookies = request.cookies.getAll();
  const hasSession = allCookies.some(
    (cookie) => 
      (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) || 
      cookie.name === 'supabase-auth-token'
  );

  // Condition 1: /admin or /admin/* without active session
  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  // Condition 2: /login with active session → redirect to admin
  // Note: '/' is the public marketing landing page and should always be accessible
  if (pathname === '/login') {
    if (hasSession) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = '/admin/restaurants';
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
