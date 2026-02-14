'use client';

import SEOHead, { generateOrganizationSchema } from '@/components/seo/SEOHead';
import { H1, H2, H3, Paragraph, Lead, Blockquote, List } from '@/components/seo/SemanticText';
import { useGeolocation, LocationGreeting } from '@/hooks/useGeolocation';
import { SEO_CONTENT } from '@/content/seo-content';
import AnimatedCard, { AnimatedCardGrid } from '@/components/ui/AnimatedCard';
import BouncyButton from '@/components/ui/BouncyButton';
import FloatingText from '@/components/ui/FloatingText';
import Link from 'next/link';

export default function AboutPage() {
  const { location } = useGeolocation();

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title={SEO_CONTENT.about.title}
        description={SEO_CONTENT.about.description}
        keywords={[...SEO_CONTENT.keywords.primary]}
        location={location}
        structuredData={generateOrganizationSchema()}
        canonical="https://www.isoflux.app/about"
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
              <Link href="/about" className="text-[#4FC3F7]">
                About
              </Link>
              <Link href="/services" className="hover:text-[#4FC3F7] transition-colors">
                Services
              </Link>
              <Link href="/contact" className="hover:text-[#4FC3F7] transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 py-16 space-y-16">
          {/* Hero Section */}
          <section className="text-center">
            <LocationGreeting className="text-lg text-[#4FC3F7] mb-4" />
            
            <H1 className="gradient-text mb-6">
              {SEO_CONTENT.about.h1}
            </H1>

            <Lead className="max-w-4xl mx-auto">
              {SEO_CONTENT.about.mission.description}
            </Lead>
          </section>

          {/* Mission */}
          <AnimatedCard>
            <H2 className="gradient-text mb-6">
              {SEO_CONTENT.about.mission.title}
            </H2>
            
            <Paragraph>
              {SEO_CONTENT.about.mission.description}
            </Paragraph>

            <Blockquote>
              "A non-compliant transaction cannot exist any more than a square circle can exist in nature."
            </Blockquote>
          </AnimatedCard>

          {/* Story */}
          <section>
            <H2 className="mb-8">
              {SEO_CONTENT.about.story.title}
            </H2>

            <div className="grid md:grid-cols-2 gap-8">
              <AnimatedCard>
                <Paragraph>
                  {SEO_CONTENT.about.story.content}
                </Paragraph>
              </AnimatedCard>

              <AnimatedCard enableTilt>
                <H3 className="text-[#4FC3F7] mb-4">The Problem We Solved</H3>
                <List>
                  <li>Banks spending billions on compliance</li>
                  <li>Still facing regulatory violations</li>
                  <li>Probabilistic AI making "guesses"</li>
                  <li>Reactive human error</li>
                  <li>Lag in verification systems</li>
                </List>
              </AnimatedCard>
            </div>
          </section>

          {/* Technology */}
          <section>
            <H2 className="text-center mb-4">
              {SEO_CONTENT.about.technology.title}
            </H2>
            
            <Paragraph className="text-center text-gray-300 mb-12 max-w-3xl mx-auto">
              {SEO_CONTENT.about.technology.description}
            </Paragraph>

            <AnimatedCardGrid columns={3} staggerDelay={0.2}>
              {SEO_CONTENT.about.technology.pillars.map((pillar, index) => (
                <AnimatedCard key={index} enableTilt enableGlow>
                  <H3 className="text-[#4FC3F7] mb-4">{pillar.name}</H3>
                  <Paragraph className="text-gray-300">{pillar.description}</Paragraph>
                </AnimatedCard>
              ))}
            </AnimatedCardGrid>
          </section>

          {/* Values */}
          <section>
            <H2 className="text-center mb-12">Our Core Values</H2>

            <AnimatedCardGrid columns={2} staggerDelay={0.15}>
              {SEO_CONTENT.about.values.map((value, index) => (
                <AnimatedCard key={index}>
                  <H3 className="text-[#7C4DFF] mb-3">{value.title}</H3>
                  <Paragraph className="text-gray-300">{value.description}</Paragraph>
                </AnimatedCard>
              ))}
            </AnimatedCardGrid>
          </section>

          {/* CTA */}
          <section className="text-center py-12">
            <FloatingText className="text-4xl font-bold mb-8">
              Join the Compliance Revolution
            </FloatingText>

            <Paragraph className="max-w-2xl mx-auto mb-8">
              See how IsoFlux can eliminate compliance violations at your institution.
            </Paragraph>

            <div className="flex gap-4 justify-center">
              <BouncyButton variant="primary" size="lg" enableGlow>
                <Link href="/contact">Schedule Demo</Link>
              </BouncyButton>
              <BouncyButton variant="outline" size="lg">
                <Link href="/services">View Services</Link>
              </BouncyButton>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 p-8 mt-16">
          <div className="max-w-7xl mx-auto text-center text-gray-400">
            <Paragraph>
              © 2026 IsoFlux. All rights reserved. | 
              <Link href="/privacy" className="hover:text-[#4FC3F7] ml-2">Privacy Policy</Link> | 
              <Link href="/terms" className="hover:text-[#4FC3F7] ml-2">Terms of Service</Link>
            </Paragraph>
          </div>
        </footer>
      </div>
    </>
  );
}
