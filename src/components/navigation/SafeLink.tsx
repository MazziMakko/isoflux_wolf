'use client';

import Link from 'next/link';
import { isValidRoute } from '@/lib/navigation/routes';
import { ReactNode, AnchorHTMLAttributes } from 'react';

interface SafeLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
  className?: string;
  fallbackRoute?: string;
  onInvalidRoute?: (route: string) => void;
  external?: boolean;
}

/**
 * SafeLink Component
 * 
 * A validated wrapper around Next.js Link component that ensures
 * all navigation targets are valid routes. Provides compile-time
 * and runtime safety for navigation.
 * 
 * Features:
 * - Runtime route validation
 * - Automatic fallback for invalid routes
 * - Error logging for invalid routes
 * - External link detection
 * - Type-safe routing
 * 
 * @param href - Target route (validated against route registry)
 * @param children - Link content
 * @param className - CSS classes
 * @param fallbackRoute - Route to use if href is invalid (default: '/')
 * @param onInvalidRoute - Callback for invalid route detection
 * @param external - Force external link behavior
 * 
 * @example
 * ```tsx
 * <SafeLink href="/about">About Us</SafeLink>
 * <SafeLink href="/invalid" fallbackRoute="/contact">Contact</SafeLink>
 * <SafeLink href="https://example.com" external>External Site</SafeLink>
 * ```
 */
export default function SafeLink({
  href,
  children,
  className = '',
  fallbackRoute = '/',
  onInvalidRoute,
  external = false,
  ...props
}: SafeLinkProps) {
  // Check if route is valid
  const isValid = isValidRoute(href);
  const isExternal = external || href.startsWith('http://') || href.startsWith('https://');
  
  // Log invalid route in development
  if (!isValid && process.env.NODE_ENV === 'development') {
    console.error(`[SafeLink] Invalid route detected: "${href}"`);
    console.error(`[SafeLink] Falling back to: "${fallbackRoute}"`);
    console.error('[SafeLink] Valid routes are registered in src/lib/navigation/routes.ts');
    
    if (onInvalidRoute) {
      onInvalidRoute(href);
    }
  }
  
  // Use fallback route if invalid
  const safeHref = isValid ? href : fallbackRoute;
  
  // External links
  if (isExternal) {
    return (
      <a
        href={safeHref}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }
  
  // Internal Next.js links
  return (
    <Link
      href={safeHref}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * SafeLink with custom styling variants
 */
interface StyledLinkProps extends SafeLinkProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'nav';
}

export function StyledLink({
  variant = 'default',
  className = '',
  ...props
}: StyledLinkProps) {
  const variants = {
    default: 'text-white hover:text-[#4FC3F7] transition-colors',
    primary: 'text-[#4FC3F7] hover:text-[#7C4DFF] font-semibold transition-colors',
    secondary: 'text-gray-400 hover:text-white transition-colors',
    ghost: 'text-gray-500 hover:text-gray-300 transition-colors',
    nav: 'text-white hover:text-[#4FC3F7] transition-colors font-medium',
  };
  
  return (
    <SafeLink
      className={`${variants[variant]} ${className}`}
      {...props}
    />
  );
}
