'use client';

import { useState } from 'react';
import { StyledLink } from './SafeLink';
import SafeButton from './SafeButton';
import { ROUTES, NAV_MENU } from '@/lib/navigation/routes';
import { motion, AnimatePresence } from 'framer-motion';

interface MainNavigationProps {
  variant?: 'default' | 'transparent' | 'solid';
  showAuthButtons?: boolean;
}

/**
 * MainNavigation Component
 * 
 * Primary navigation header for IsoFlux with validated routing.
 * All links use SafeLink to ensure navigation safety.
 * 
 * Features:
 * - Validated navigation links
 * - Mobile responsive menu
 * - IsoFlux branding
 * - Authentication buttons
 * - Sticky header option
 * - Multiple variants
 * 
 * @param variant - Navigation style variant
 * @param showAuthButtons - Show login/signup buttons
 * 
 * @example
 * ```tsx
 * <MainNavigation variant="transparent" showAuthButtons />
 * ```
 */
export default function MainNavigation({
  variant = 'default',
  showAuthButtons = true,
}: MainNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const variants = {
    default: 'bg-[#0d1f3a]/95 backdrop-blur-lg border-b border-white/10',
    transparent: 'bg-transparent',
    solid: 'bg-[#0d1f3a]',
  };
  
  return (
    <header className={`sticky top-0 z-50 ${variants[variant]}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <StyledLink href={ROUTES.ISOFLUX} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/branding/isoflux-logo.png"
              alt="IsoFlux"
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-white">IsoFlux</span>
          </StyledLink>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_MENU.MAIN.map((item) => (
              <StyledLink
                key={item.route}
                href={item.route}
                variant="nav"
              >
                {item.label}
              </StyledLink>
            ))}
            
            {/* Showcase Dropdown */}
            <div className="relative group">
              <button className="text-white hover:text-[#4FC3F7] transition-colors font-medium">
                Showcase ▾
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a2f4a] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {NAV_MENU.SHOWCASE.map((item) => (
                  <StyledLink
                    key={item.route}
                    href={item.route}
                    className="block px-4 py-3 hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {item.label}
                  </StyledLink>
                ))}
              </div>
            </div>
          </div>
          
          {/* Auth Buttons */}
          {showAuthButtons && (
            <div className="hidden md:flex items-center gap-4">
              <SafeButton
                to={ROUTES.LOGIN}
                variant="ghost"
                size="sm"
              >
                Login
              </SafeButton>
              <SafeButton
                to={ROUTES.DASHBOARD}
                variant="primary"
                size="sm"
              >
                Get Started
              </SafeButton>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10"
            >
              <div className="py-4 space-y-2">
                {NAV_MENU.MAIN.map((item) => (
                  <StyledLink
                    key={item.route}
                    href={item.route}
                    className="block px-4 py-3 hover:bg-white/10 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </StyledLink>
                ))}
                
                <div className="px-4 py-2 text-sm text-gray-400">Showcase</div>
                {NAV_MENU.SHOWCASE.map((item) => (
                  <StyledLink
                    key={item.route}
                    href={item.route}
                    className="block px-8 py-2 text-sm hover:bg-white/10 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </StyledLink>
                ))}
                
                {showAuthButtons && (
                  <div className="px-4 pt-4 space-y-2">
                    <SafeButton
                      to={ROUTES.LOGIN}
                      variant="ghost"
                      size="md"
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </SafeButton>
                    <SafeButton
                      to={ROUTES.DASHBOARD}
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </SafeButton>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

/**
 * Footer Navigation Component
 */
export function FooterNavigation() {
  return (
    <footer className="border-t border-white/10 bg-[#0d1f3a] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/branding/isoflux-logo.png"
                alt="IsoFlux"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-white">IsoFlux</span>
            </div>
            <p className="text-gray-400 text-sm">
              The Compliance Wolf. Compliance in milliseconds.
            </p>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <div className="space-y-2">
              {[
                { label: 'About', route: ROUTES.ABOUT },
                { label: 'Services', route: ROUTES.SERVICES },
                { label: 'Contact', route: ROUTES.CONTACT },
              ].map((item) => (
                <StyledLink
                  key={item.route}
                  href={item.route}
                  variant="secondary"
                  className="block text-sm"
                >
                  {item.label}
                </StyledLink>
              ))}
            </div>
          </div>
          
          {/* Showcase */}
          <div>
            <h4 className="text-white font-semibold mb-4">Showcase</h4>
            <div className="space-y-2">
              {NAV_MENU.SHOWCASE.map((item) => (
                <StyledLink
                  key={item.route}
                  href={item.route}
                  variant="secondary"
                  className="block text-sm"
                >
                  {item.label}
                </StyledLink>
              ))}
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <div className="space-y-2">
              {NAV_MENU.LEGAL.map((item) => (
                <StyledLink
                  key={item.route}
                  href={item.route}
                  variant="secondary"
                  className="block text-sm"
                >
                  {item.label}
                </StyledLink>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
          <p>© 2026 IsoFlux. All rights reserved. | The Compliance Wolf</p>
        </div>
      </div>
    </footer>
  );
}
