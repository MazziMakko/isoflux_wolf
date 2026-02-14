'use client';

import SEOHead, { generateOrganizationSchema } from '@/components/seo/SEOHead';
import { H1, H2, H3, H4, Paragraph, Lead, Blockquote, List } from '@/components/seo/SemanticText';
import { useGeolocation, LocationGreeting } from '@/hooks/useGeolocation';
import { SEO_CONTENT } from '@/content/seo-content';
import AnimatedCard, { AnimatedCardGrid } from '@/components/ui/AnimatedCard';
import BouncyButton, { BouncyButtonGroup } from '@/components/ui/BouncyButton';
import FloatingText, { FloatingTextStagger } from '@/components/ui/FloatingText';
import Link from 'next/link';

export default function IsoFluxHome() {
  const { location } = useGeolocation();

  return (
    <>
      {/* SEO Meta Tags with Location Optimization */}
      <SEOHead
        title={SEO_CONTENT.home.title}
        description={SEO_CONTENT.home.description}
        keywords={[...SEO_CONTENT.keywords.primary]}
        location={location}
        structuredData={generateOrganizationSchema()}
        ogImage="/branding/isoflux-logo.png"
        ogUrl="https://www.isoflux.app"
        canonical="https://www.isoflux.app"
        twitterCard="summary_large_image"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1e] to-[#1a1a2e] text-white">
        {/* Navigation */}
        <header className="fixed top-0 w-full z-50 glass-card border-b border-white/10 backdrop-blur-lg">
          <nav className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/isoflux" className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/branding/isoflux-logo.png"
                  alt="IsoFlux - ISO 20022 Compliance Platform"
                  className="w-10 h-10"
                />
                <span className="text-2xl font-bold">IsoFlux</span>
              </Link>

              <div className="flex items-center gap-8">
                <Link href="/about" className="hover:text-[#4FC3F7] transition-colors">
                  About
                </Link>
                <Link href="/services" className="hover:text-[#4FC3F7] transition-colors">
                  Services
                </Link>
                <Link href="/docs/ISOFLUX.md" className="hover:text-[#4FC3F7] transition-colors">
                  Docs
                </Link>
                <Link href="/contact" className="hover:text-[#4FC3F7] transition-colors">
                  Contact
                </Link>
                <BouncyButton variant="primary" size="sm">
                  <Link href="/dashboard">Login</Link>
                </BouncyButton>
              </div>
            </div>
          </nav>
        </header>

        <main className="pt-24">
          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center px-8">
            <div className="max-w-6xl mx-auto text-center">
              <LocationGreeting className="text-lg text-[#4FC3F7] mb-6" />

              <H1 className="mb-6">
                <FloatingTextStagger
                  words={['The', 'Geometry', 'of', 'Value']}
                  className="text-5xl md:text-7xl font-bold gradient-text"
                  staggerDelay={0.15}
                />
              </H1>

              <Lead className="text-2xl max-w-4xl mx-auto mb-4">
                {SEO_CONTENT.home.hero.headline}
              </Lead>

              <Paragraph className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                {SEO_CONTENT.home.hero.subheadline}
              </Paragraph>

              <Paragraph className="text-lg text-gray-400 mb-12 max-w-4xl mx-auto">
                {SEO_CONTENT.home.hero.description}
              </Paragraph>

              <BouncyButtonGroup staggerDelay={0.15}>
                <BouncyButton variant="primary" size="lg" enableGlow>
                  <Link href="/contact">{SEO_CONTENT.home.hero.cta.primary}</Link>
                </BouncyButton>
                <BouncyButton variant="outline" size="lg">
                  <Link href="/experience">{SEO_CONTENT.home.hero.cta.secondary}</Link>
                </BouncyButton>
                <BouncyButton variant="ghost" size="lg">
                  <Link href="/docs/ISOFLUX.md">Read Documentation</Link>
                </BouncyButton>
              </BouncyButtonGroup>

              <div className="mt-16 flex items-center justify-center gap-12 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>SOC 2 Type II Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>99.99% Uptime SLA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Bank-Grade Security</span>
                </div>
              </div>
            </div>
          </section>

          {/* The Trinity of Order */}
          <section className="py-20 px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <H2 className="gradient-text mb-6">
                  {SEO_CONTENT.home.features.title}
                </H2>
                <Lead className="text-gray-300 max-w-3xl mx-auto">
                  Three revolutionary technologies that eliminate compliance violations
                </Lead>
              </div>

              <AnimatedCardGrid columns={3} staggerDelay={0.2}>
                {SEO_CONTENT.home.features.items.map((feature, index) => (
                  <AnimatedCard key={index} enableTilt enableGlow>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF] rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                        {index === 0 ? '⚡' : index === 1 ? '🔒' : '⚛️'}
                      </div>

                      <H3 className="text-[#4FC3F7] mb-2">{feature.title}</H3>
                      
                      <Paragraph className="text-xl font-semibold text-white mb-4">
                        {feature.subtitle}
                      </Paragraph>

                      <Paragraph className="text-gray-300 mb-6">
                        {feature.description}
                      </Paragraph>

                      <div className="text-left">
                        <Paragraph className="text-sm text-gray-500 mb-2">
                          Key Technologies:
                        </Paragraph>
                        <div className="flex flex-wrap gap-2">
                          {feature.keywords.map((keyword, i) => (
                            <span
                              key={i}
                              className="text-xs bg-white/5 px-3 py-1 rounded-full text-gray-400"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </AnimatedCardGrid>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-20 px-8 bg-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <H2 className="mb-6">{SEO_CONTENT.home.benefits.title}</H2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {SEO_CONTENT.home.benefits.items.map((benefit, index) => (
                  <AnimatedCard key={index}>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                      <Paragraph className="text-gray-300">{benefit}</Paragraph>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-20 px-8">
            <div className="max-w-7xl mx-auto">
              <AnimatedCard className="text-center">
                <H2 className="mb-12">Proven Performance at Scale</H2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {SEO_CONTENT.home.stats.map((stat, index) => (
                    <div key={index}>
                      <FloatingText
                        className="text-5xl md:text-6xl font-bold gradient-text mb-2"
                        delay={index * 0.2}
                        amplitude={20}
                      >
                        {stat.value}
                      </FloatingText>
                      <H3 className="text-xl text-white mb-2">{stat.label}</H3>
                      <Paragraph className="text-sm text-gray-400">
                        {stat.description}
                      </Paragraph>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </section>

          {/* Testimonial */}
          <section className="py-20 px-8">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard enableTilt className="text-center">
                <Blockquote className="border-none text-2xl mb-6">
                  "A non-compliant transaction cannot exist any more than a square circle can exist in nature."
                </Blockquote>
                <Paragraph className="text-gray-400">
                  — The IsoFlux Philosophy
                </Paragraph>
              </AnimatedCard>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-8">
            <div className="max-w-4xl mx-auto text-center">
              <H2 className="mb-6">
                <FloatingText amplitude={25}>
                  Ready to Eliminate Compliance Violations?
                </FloatingText>
              </H2>

              <Paragraph className="text-xl text-gray-300 mb-12">
                Join leading financial institutions using geometric validation for absolute compliance.
              </Paragraph>

              <BouncyButtonGroup staggerDelay={0.15}>
                <BouncyButton variant="primary" size="lg" enableGlow>
                  <Link href="/contact">Schedule Demo</Link>
                </BouncyButton>
                <BouncyButton variant="secondary" size="lg">
                  <Link href="/services">Explore Services</Link>
                </BouncyButton>
              </BouncyButtonGroup>

              <Paragraph className="text-sm text-gray-500 mt-8">
                Enterprise-ready • Bank-grade security • 99.99% uptime
              </Paragraph>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/branding/isoflux-logo.png"
                    alt="IsoFlux"
                    className="w-8 h-8"
                  />
                  <span className="text-xl font-bold">IsoFlux</span>
                </div>
                <Paragraph className="text-gray-400 text-sm">
                  The Compliance Wolf. Compliance in milliseconds.
                </Paragraph>
              </div>

              <div>
                <H4 className="mb-4 text-white">Product</H4>
                <List className="list-none space-y-2 text-sm">
                  <li>
                    <Link href="/services" className="text-gray-400 hover:text-[#4FC3F7]">
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/ISOFLUX.md" className="text-gray-400 hover:text-[#4FC3F7]">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/API.md" className="text-gray-400 hover:text-[#4FC3F7]">
                      API Reference
                    </Link>
                  </li>
                  <li>
                    <Link href="/experience" className="text-gray-400 hover:text-[#4FC3F7]">
                      3D Experience
                    </Link>
                  </li>
                </List>
              </div>

              <div>
                <H4 className="mb-4 text-white">Company</H4>
                <List className="list-none space-y-2 text-sm">
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-[#4FC3F7]">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-400 hover:text-[#4FC3F7]">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="text-gray-400 hover:text-[#4FC3F7]">
                      Careers
                    </Link>
                  </li>
                </List>
              </div>

              <div>
                <H4 className="mb-4 text-white">Legal</H4>
                <List className="list-none space-y-2 text-sm">
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-[#4FC3F7]">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-400 hover:text-[#4FC3F7]">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/security" className="text-gray-400 hover:text-[#4FC3F7]">
                      Security
                    </Link>
                  </li>
                </List>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 text-center">
              <Paragraph className="text-gray-400 text-sm">
                © 2026 IsoFlux. All rights reserved. | ISO 20022 Compliance Platform
              </Paragraph>
              <Paragraph className="text-gray-500 text-xs mt-2">
                Serving financial institutions in {location.city || 'cities'} worldwide
              </Paragraph>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
