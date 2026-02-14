'use client';

import { motion } from 'framer-motion';
import FloatingText from '@/components/ui/FloatingText';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

/**
 * LoadingSpinner Component
 * 
 * Animated loading spinner with optional message.
 * 
 * @param size - Spinner size
 * @param message - Optional loading message
 * 
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" message="Loading data..." />
 * ```
 */
export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizes[size]} border-[#4FC3F7] border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && (
        <p className="text-gray-400 text-sm">{message}</p>
      )}
    </div>
  );
}

/**
 * PageLoading Component
 * 
 * Full-page loading state with IsoFlux branding.
 */
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3a] to-[#1a2f4a] flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/branding/isoflux-logo.png"
            alt="IsoFlux"
            className="w-20 h-20 mx-auto"
          />
        </motion.div>

        {/* Loading Spinner */}
        <LoadingSpinner size="lg" />

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <p className="text-white text-lg">{message}</p>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * SkeletonLoader Component
 * 
 * Skeleton loading state for content placeholders.
 */
export function SkeletonLoader({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-white/10 rounded animate-pulse"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

/**
 * EmptyState Component
 * 
 * Display when there's no data to show.
 */
export function EmptyState({
  icon = '📭',
  title = 'No Data',
  description = 'There is nothing to display here.',
  action,
}: {
  icon?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-5xl">
          <FloatingText amplitude={15} duration={3}>
            {icon}
          </FloatingText>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{description}</p>
        {action}
      </motion.div>
    </div>
  );
}

/**
 * ErrorFallback Component
 * 
 * Simple error fallback for use with ErrorBoundary.
 */
export function ErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError?: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500/30">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Error Loading Component
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          {error.message}
        </p>
        {resetError && (
          <BouncyButton
            to={ROUTES.HOME}
            variant="outline"
            size="sm"
            onClick={resetError}
          >
            Try Again
          </BouncyButton>
        )}
      </div>
    </div>
  );
}
