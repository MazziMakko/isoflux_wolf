'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

/**
 * SplashScreen Component
 * 
 * Displays the IsoFlux logo with an animated loading sequence
 * on initial application load. Uses navy blue trust worthy color scheme.
 * 
 * @param onComplete - Callback when splash screen animation completes
 * @param minDuration - Minimum duration in milliseconds (default: 2000)
 * 
 * @example
 * ```tsx
 * <SplashScreen onComplete={() => setLoaded(true)} />
 * ```
 */
export default function SplashScreen({ onComplete, minDuration = 2000 }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, minDuration / 10);

    // Hide splash screen after minimum duration
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); // Allow fade out animation
    }, minDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0d1f3a] to-[#1a2f4a]"
        >
          <div className="relative">
            {/* Animated background circles */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 -m-32 rounded-full bg-[#4FC3F7]/10 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute inset-0 -m-40 rounded-full bg-[#7C4DFF]/10 blur-3xl"
            />

            {/* Logo container */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Logo with pulse animation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src="/branding/isoflux-logo.png"
                  alt="IsoFlux"
                  className="w-32 h-32 md:w-40 md:h-40"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>

              {/* Brand name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-8 text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  IsoFlux
                </h1>
                <p className="text-[#4FC3F7] text-sm md:text-base tracking-wide">
                  THE GEOMETRY OF VALUE
                </p>
              </motion.div>

              {/* Loading bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-12 w-64"
              >
                <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#4FC3F7] to-[#7C4DFF]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-center text-gray-400 text-xs mt-3">
                  Loading... {progress}%
                </p>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mt-8 flex gap-6 text-xs text-gray-500"
              >
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>Bank-Grade Security</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>SOC 2 Type II</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>99.99% Uptime</span>
                </div>
              </motion.div>
            </div>

            {/* Geometric pattern overlay */}
            <div className="absolute inset-0 -z-10 opacity-5">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
