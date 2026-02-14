'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import FloatingText from '@/components/ui/FloatingText';
import BouncyButton from '@/components/ui/BouncyButton';
import { ROUTES } from '@/lib/navigation/routes';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary
 * 
 * Catches all unhandled errors in the application and displays
 * a friendly recovery interface instead of crashing.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Boundary] Caught error:', error);
    }
    
    // Log to error tracking service (e.g., Sentry, DataDog)
    // logErrorToService(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3a] to-[#1a2f4a] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Error Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
            <FloatingText
              className="text-6xl"
              amplitude={10}
              duration={2}
            >
              ⚠️
            </FloatingText>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Something Went Wrong
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            We encountered an unexpected error in the system.
          </p>
          <p className="text-gray-400">
            Don&apos;t worry, our team has been notified and we&apos;re working on it.
          </p>
        </motion.div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left"
          >
            <p className="text-sm font-mono text-red-400 mb-2">
              <strong>Error:</strong> {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-500">
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
          </motion.div>
        )}

        {/* Recovery Options */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <BouncyButton
            to={ROUTES.HOME}
            variant="primary"
            size="lg"
            enableGlow
            onClick={() => {
              // Clear error and navigate
              reset();
            }}
          >
            Try Again
          </BouncyButton>
          <BouncyButton
            to={ROUTES.ISOFLUX}
            variant="outline"
            size="lg"
          >
            Go to Home
          </BouncyButton>
          <BouncyButton
            to={ROUTES.CONTACT}
            variant="ghost"
            size="lg"
          >
            Report Issue
          </BouncyButton>
        </motion.div>

        {/* Troubleshooting Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-white/10 pt-8"
        >
          <p className="text-gray-400 mb-4 text-sm">
            If the problem persists, try these steps:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="glass-card p-4 rounded-lg">
              <div className="text-2xl mb-2">🔄</div>
              <p className="text-white font-semibold mb-1">Refresh Page</p>
              <p className="text-gray-400 text-xs">
                Press Ctrl+R (Cmd+R on Mac)
              </p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="text-2xl mb-2">🗑️</div>
              <p className="text-white font-semibold mb-1">Clear Cache</p>
              <p className="text-gray-400 text-xs">
                Clear browser cache and cookies
              </p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="text-2xl mb-2">📞</div>
              <p className="text-white font-semibold mb-1">Contact Us</p>
              <p className="text-gray-400 text-xs">
                Email: support@isoflux.app
              </p>
            </div>
          </div>
        </motion.div>

        {/* IsoFlux Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 flex items-center justify-center gap-3 opacity-50"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/branding/isoflux-logo.png"
            alt="IsoFlux"
            className="w-8 h-8"
          />
          <span className="text-white text-sm">The Compliance Wolf</span>
        </motion.div>
      </div>
    </div>
  );
}
