'use client';

import { motion } from 'framer-motion';
import FloatingText from '@/components/ui/FloatingText';
import BouncyButton from '@/components/ui/BouncyButton';
import SafeLink from '@/components/navigation/SafeLink';
import { ROUTES } from '@/lib/navigation/routes';

/**
 * Custom 404 Not Found Page
 * 
 * Displayed when users navigate to non-existent routes.
 * Features friendly messaging and clear navigation options.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3a] to-[#1a2f4a] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <FloatingText
            className="text-9xl md:text-[12rem] font-bold gradient-text"
            amplitude={30}
            duration={3}
          >
            404
          </FloatingText>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Looks like this page doesn&apos;t exist in our geometric space.
          </p>
          <p className="text-gray-400">
            The route you&apos;re looking for may have been moved or never existed.
          </p>
        </motion.div>

        {/* Animated Geometric Pattern */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute inset-0 -z-10 pointer-events-none"
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="404-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-[#4FC3F7]"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#404-grid)" />
          </svg>
        </motion.div>

        {/* Navigation Options */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <BouncyButton
            to={ROUTES.ISOFLUX}
            variant="primary"
            size="lg"
            enableGlow
          >
            ← Back to Home
          </BouncyButton>
          <BouncyButton
            to={ROUTES.CONTACT}
            variant="outline"
            size="lg"
          >
            Contact Support
          </BouncyButton>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-white/10 pt-8"
        >
          <p className="text-gray-400 mb-4">Or try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <SafeLink
              href={ROUTES.ABOUT}
              className="text-[#4FC3F7] hover:text-[#7C4DFF] transition-colors"
            >
              About Us
            </SafeLink>
            <span className="text-gray-600">•</span>
            <SafeLink
              href={ROUTES.SERVICES}
              className="text-[#4FC3F7] hover:text-[#7C4DFF] transition-colors"
            >
              Services
            </SafeLink>
            <span className="text-gray-600">•</span>
            <SafeLink
              href={ROUTES.EXPERIENCE}
              className="text-[#4FC3F7] hover:text-[#7C4DFF] transition-colors"
            >
              3D Experience
            </SafeLink>
            <span className="text-gray-600">•</span>
            <SafeLink
              href={ROUTES.DASHBOARD}
              className="text-[#4FC3F7] hover:text-[#7C4DFF] transition-colors"
            >
              Dashboard
            </SafeLink>
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
