'use client';

import SEOHead, { generateSoftwareSchema } from '@/components/seo/SEOHead';
import { H1, H2, H3, H4, Paragraph, Lead, List } from '@/components/seo/SemanticText';
import { useGeolocation, LocationGreeting } from '@/hooks/useGeolocation';
import { SEO_CONTENT } from '@/content/seo-content';
import AnimatedCard, { AnimatedCardGrid } from '@/components/ui/AnimatedCard';
import BouncyButton from '@/components/ui/BouncyButton';
import FloatingText from '@/components/ui/FloatingText';
import Link from 'next/link';

export default function ServicesPage() {
  const { location } = useGeolocation();

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title={SEO_CONTENT.services.title}
        description={SEO_CONTENT.services.description}
        keywords={[
          ...SEO_CONTENT.keywords.primary,
          ...SEO_CONTENT.keywords.technical,
        ]}
        location={location}
        structuredData={generateSoftwareSchema()}
        canonical="https://www.isoflux.app/services"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1e] to-[#1a1a2e] text-white">
        {/* Header */}
        <header className="p-8 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/branding/isoflux-logo.png"
                alt="IsoFlux Logo"
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold">IsoFlux</span>
            </Link>

            <nav className="flex gap-6">
              <Link href="/" className="hover:text-[#4FC3F7] transition-colors">
                Home
              </Link>
              <Link href="/about" className="hover:text-[#4FC3F7] transition-colors">
                About
              </Link>
              <Link href="/services" className="text-[#4FC3F7]">
                Services
              </Link>
              <Link href="/contact" className="hover:text-[#4FC3F7] transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 py-16 space-y-16">
          {/* Hero */}
          <section className="text-center">
            <LocationGreeting className="text-lg text-[#4FC3F7] mb-4" />
            
            <H1 className="gradient-text mb-6">
              {SEO_CONTENT.services.h1}
            </H1>

            <Lead className="max-w-4xl mx-auto">
              {SEO_CONTENT.services.intro}
            </Lead>
          </section>

          {/* Core Compliance Services */}
          <section>
            <H2 className="text-center mb-12">
              {SEO_CONTENT.services.offerings[0].category}
            </H2>

            <AnimatedCardGrid columns={1} staggerDelay={0.2}>
              {SEO_CONTENT.services.offerings[0].services.map((service, index) => (
                <AnimatedCard key={index} enableTilt>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <H3 className="text-[#4FC3F7] mb-4">{service.title}</H3>
                      <Paragraph className="text-gray-300 mb-6">
                        {service.description}
                      </Paragraph>
                      <BouncyButton variant="outline" size="sm">
                        <Link href="/contact">Request Demo</Link>
                      </BouncyButton>
                    </div>

                    <div>
                      <H4 className="text-white mb-3">Key Features</H4>
                      <List>
                        {service.features.map((feature, i) => (
                          <li key={i} className="text-gray-300">{feature}</li>
                        ))}
                      </List>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </AnimatedCardGrid>
          </section>

          {/* Advanced Solutions */}
          <section>
            <H2 className="text-center mb-12">
              {SEO_CONTENT.services.offerings[1].category}
            </H2>

            <AnimatedCardGrid columns={1} staggerDelay={0.2}>
              {SEO_CONTENT.services.offerings[1].services.map((service, index) => (
                <AnimatedCard key={index} enableGlow>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <H3 className="text-[#7C4DFF] mb-4">{service.title}</H3>
                      <Paragraph className="text-gray-300 mb-6">
                        {service.description}
                      </Paragraph>
                      <BouncyButton variant="secondary" size="sm">
                        <Link href="/contact">Learn More</Link>
                      </BouncyButton>
                    </div>

                    <div>
                      <H4 className="text-white mb-3">What's Included</H4>
                      <List>
                        {service.features.map((feature, i) => (
                          <li key={i} className="text-gray-300">{feature}</li>
                        ))}
                      </List>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </AnimatedCardGrid>
          </section>

          {/* Why Choose IsoFlux */}
          <section className="py-12">
            <AnimatedCard className="text-center">
              <H2 className="mb-8">Why Financial Institutions Choose IsoFlux</H2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div>
                  <FloatingText className="text-5xl font-bold text-[#4FC3F7] mb-2">
                    0%
                  </FloatingText>
                  <Paragraph className="text-gray-400">Error Rate</Paragraph>
                </div>

                <div>
                  <FloatingText className="text-5xl font-bold text-[#7C4DFF] mb-2" delay={0.2}>
                    &lt;150ms
                  </FloatingText>
                  <Paragraph className="text-gray-400">Processing Time</Paragraph>
                </div>

                <div>
                  <FloatingText className="text-5xl font-bold text-[#FF4081] mb-2" delay={0.4}>
                    1000+
                  </FloatingText>
                  <Paragraph className="text-gray-400">TPS</Paragraph>
                </div>

                <div>
                  <FloatingText className="text-5xl font-bold text-[#00BCD4] mb-2" delay={0.6}>
                    99.99%
                  </FloatingText>
                  <Paragraph className="text-gray-400">Uptime</Paragraph>
                </div>
              </div>
            </AnimatedCard>
          </section>

          {/* CTA */}
          <section className="text-center py-16">
            <H2 className="mb-6">{SEO_CONTENT.services.cta.title}</H2>
            
            <Paragraph className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {SEO_CONTENT.services.cta.description}
            </Paragraph>

            <div className="flex gap-4 justify-center">
              <BouncyButton variant="primary" size="lg" enableGlow>
                <Link href="/contact">{SEO_CONTENT.services.cta.button}</Link>
              </BouncyButton>
              <BouncyButton variant="outline" size="lg">
                <Link href="/docs/ISOFLUX.md">Read Documentation</Link>
              </BouncyButton>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 p-8 mt-16">
          <div className="max-w-7xl mx-auto text-center text-gray-400">
            <Paragraph>
              © 2026 IsoFlux. All rights reserved. | 
              <Link href="/privacy" className="hover:text-[#4FC3F7] ml-2">Privacy</Link> | 
              <Link href="/terms" className="hover:text-[#4FC3F7] ml-2">Terms</Link>
            </Paragraph>
          </div>
        </footer>
      </div>
    </>
  );
}
