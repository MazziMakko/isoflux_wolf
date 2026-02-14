import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get pathname
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'));

  // API webhook routes (use API key or signature verification instead)
  const isWebhookRoute = pathname.startsWith('/api/webhooks/');

  if (isPublicRoute || isWebhookRoute) {
    return NextResponse.next();
  }

  // For dashboard and protected routes, check authentication
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('fluxforge_token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Security headers for all routes
  const response = NextResponse.next();
  
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
