'use client';

import { useRouter } from 'next/navigation';
import { isValidRoute } from '@/lib/navigation/routes';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface SafeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  to: string;
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fallbackRoute?: string;
  onInvalidRoute?: (route: string) => void;
  external?: boolean;
}

/**
 * SafeButton Component
 * 
 * A button component that navigates to validated routes.
 * Provides the same safety guarantees as SafeLink but in button form.
 * 
 * Features:
 * - Runtime route validation
 * - Automatic fallback for invalid routes
 * - Error logging for invalid routes
 * - Multiple style variants
 * - Type-safe routing
 * - External link support
 * 
 * @param to - Target route (validated against route registry)
 * @param children - Button content
 * @param variant - Button style variant
 * @param size - Button size
 * @param fallbackRoute - Route to use if 'to' is invalid (default: '/')
 * @param onInvalidRoute - Callback for invalid route detection
 * @param external - Open in new tab
 * 
 * @example
 * ```tsx
 * <SafeButton to="/contact" variant="primary" size="lg">
 *   Contact Us
 * </SafeButton>
 * 
 * <SafeButton to="/invalid" fallbackRoute="/home">
 *   Navigate
 * </SafeButton>
 * ```
 */
export default function SafeButton({
  to,
  children,
  variant = 'default',
  size = 'md',
  fallbackRoute = '/',
  onInvalidRoute,
  external = false,
  className = '',
  onClick,
  ...props
}: SafeButtonProps) {
  const router = useRouter();
  
  // Check if route is valid
  const isValid = isValidRoute(to);
  const isExternal = external || to.startsWith('http://') || to.startsWith('https://');
  
  // Log invalid route in development
  if (!isValid && process.env.NODE_ENV === 'development') {
    console.error(`[SafeButton] Invalid route detected: "${to}"`);
    console.error(`[SafeButton] Falling back to: "${fallbackRoute}"`);
    console.error('[SafeButton] Valid routes are registered in src/lib/navigation/routes.ts');
    
    if (onInvalidRoute) {
      onInvalidRoute(to);
    }
  }
  
  // Use fallback route if invalid
  const safeRoute = isValid ? to : fallbackRoute;
  
  // Handle button click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
    
    if (e.defaultPrevented) {
      return;
    }
    
    if (isExternal) {
      window.open(safeRoute, '_blank', 'noopener,noreferrer');
    } else {
      router.push(safeRoute);
    }
  };
  
  // Variant styles
  const variants = {
    default: 'bg-white/10 hover:bg-white/20 text-white',
    primary: 'bg-gradient-to-r from-[#4FC3F7] to-[#7C4DFF] hover:shadow-lg hover:shadow-[#4FC3F7]/50 text-white',
    secondary: 'bg-[#7C4DFF] hover:bg-[#9C27B0] text-white',
    outline: 'bg-transparent border-2 border-[#4FC3F7] hover:bg-[#4FC3F7]/10 text-[#4FC3F7]',
    ghost: 'bg-transparent hover:bg-white/10 text-white',
  };
  
  // Size styles
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
