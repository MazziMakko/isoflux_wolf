'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Dynamically import 3D canvas (client-side only)
const Canvas3D = dynamic(() => import('@/components/3d/Canvas3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a1e] to-[#1a1a2e]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#4FC3F7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading IsoFlux Experience...</p>
      </div>
    </div>
  ),
});

export default function ExperiencePage() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1e] to-[#1a1a2e]">
      {/* 3D Canvas Background */}
      <Canvas3D />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Navigation */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center pointer-events-auto"
        >
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/branding/isoflux-logo.png"
              alt="IsoFlux Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-white text-2xl font-bold">IsoFlux</span>
          </div>

          <nav className="flex gap-6">
            <Link
              href="/"
              className="text-white hover:text-[#4FC3F7] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-white hover:text-[#4FC3F7] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/docs/ISOFLUX.md"
              className="text-white hover:text-[#4FC3F7] transition-colors"
            >
              Docs
            </Link>
          </nav>
        </motion.div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl px-8">
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#4FC3F7] to-[#7C4DFF]"
            >
              The Compliance Wolf
            </motion.h1>

            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-300 mb-12"
            >
              Where compliance is not managed, but guaranteed through geometry
            </motion.p>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex gap-6 justify-center pointer-events-auto"
            >
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-[#4FC3F7] to-[#7C4DFF] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#4FC3F7]/50 transition-all"
              >
                Enter Dashboard
              </Link>
              <Link
                href="/docs/ISOFLUX.md"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-12 left-0 right-0 px-8"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rulial Parser */}
            <div className="glass-card p-6 pointer-events-auto hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF] rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Rulial Parser
              </h3>
              <p className="text-gray-400 text-sm">
                Deterministic ISO 20022 validation with 0% error rate
              </p>
            </div>

            {/* Geometric Legislator */}
            <div className="glass-card p-6 pointer-events-auto hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF] rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Geometric Legislator
              </h3>
              <p className="text-gray-400 text-sm">
                Pre-cognitive compliance through geometric boundaries
              </p>
            </div>

            {/* Entangled Ledger */}
            <div className="glass-card p-6 pointer-events-auto hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF] rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">⚛️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Entangled Ledger
              </h3>
              <p className="text-gray-400 text-sm">
                Real-time reserve verification with state entanglement
              </p>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full"></div>
          </div>
        </motion.div>
      </div>

      {/* Performance Monitor (Dev Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-20 right-4 text-white text-xs font-mono bg-black/50 p-2 rounded pointer-events-none">
          <div>Press H to toggle controls</div>
          <div>Drag to rotate | Scroll to zoom</div>
        </div>
      )}
    </main>
  );
}
