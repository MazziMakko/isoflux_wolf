import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getRedirectPath, enforceRoleAccess, canAccessDashboard } from '@/lib/wolf-shield/compliance-router';
import type { UserRole, SubscriptionStatus } from '@/lib/wolf-shield/types';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/contact',
    '/services',
    '/terms',
    '/privacy',
    '/disclaimer',
    '/license',
    '/experience',
    '/animations',
    '/pricing',
    '/msa',
    '/privacy-policy',
    '/terms-of-service',
    '/tenant-eula',
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith('/api/auth')
  );

  // API webhook routes (use API key or signature verification instead)
  const isWebhookRoute = pathname.startsWith('/api/webhooks/');

  // API routes that don't need user context
  const isApiRoute = pathname.startsWith('/api/');

  if (isPublicRoute || isWebhookRoute) {
    return applySecurityHeaders(response);
  }

  // For dashboard and protected routes, perform Wolf Shield checks
  if (pathname.startsWith('/dashboard')) {
    // Create Supabase client for server-side auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Fetch user data with role
    const { data: userData } = await supabase
      .from('users')
      .select('id, role, email')
      .eq('id', user.id)
      .single();

    if (!userData) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = userData.role as UserRole;

    // Fetch organization and subscription
    const { data: membershipData } = await supabase
      .from('organization_members')
      .select(
        `
        organization_id,
        organizations!inner (
          id,
          subscriptions (
            status,
            tier,
            current_period_end
          )
        )
      `
      )
      .eq('user_id', user.id)
      .limit(1)
      .single();

    // THE WOLF SHIELD: Enforce subscription status
    if (membershipData?.organizations) {
      const org = membershipData.organizations as any;
      const subscription = org.subscriptions?.[0];

      if (subscription) {
        const subscriptionStatus = subscription.status as SubscriptionStatus;

        // CRITICAL: Only trialing or active can access dashboard
        const allowedStatuses: SubscriptionStatus[] = ['trialing', 'active'];

        if (!allowedStatuses.includes(subscriptionStatus)) {
          // If PAST_DUE, redirect to billing (unless already there)
          if (subscriptionStatus === 'PAST_DUE' && !pathname.startsWith('/billing')) {
            return NextResponse.redirect(new URL('/billing', request.url));
          }

          // If CANCELLED or INCOMPLETE, redirect to home
          if (
            (subscriptionStatus === 'CANCELLED' || subscriptionStatus === 'INCOMPLETE') &&
            !pathname.startsWith('/billing')
          ) {
            return NextResponse.redirect(new URL('/', request.url));
          }
        }
      }
    }

    // THE WOLF SHIELD: Enforce role-based access
    const roleCheck = enforceRoleAccess(userRole, pathname);
    if (!roleCheck.allowed && roleCheck.redirect) {
      return NextResponse.redirect(new URL(roleCheck.redirect, request.url));
    }

    // Check for tenant-specific redirects (EULA acceptance)
    if (userRole === 'tenant') {
      // Check if tenant has accepted EULA
      const eulaAccepted = user.user_metadata?.eula_accepted;
      
      if (!eulaAccepted && pathname !== '/tenant-eula') {
        return NextResponse.redirect(new URL('/tenant-eula', request.url));
      }

      // Check for overdue recertification
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('recertification_status')
        .eq('user_id', user.id)
        .single();

      if (
        tenantData?.recertification_status === 'OVERDUE' &&
        !pathname.startsWith('/dashboard/tenant/documents')
      ) {
        return NextResponse.redirect(new URL('/dashboard/tenant/documents', request.url));
      }
    }
  }

  // For non-API routes, check basic auth
  if (!isApiRoute && !isPublicRoute) {
    const token = request.cookies.get('wolf_shield_token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply security headers
  return applySecurityHeaders(response);
}

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

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
