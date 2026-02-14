'use client';

import { useState } from 'react';
import SEOHead, { generateLocalBusinessSchema } from '@/components/seo/SEOHead';
import { H1, H2, H3, H4, Paragraph, Lead } from '@/components/seo/SemanticText';
import { useGeolocation, LocationGreeting } from '@/hooks/useGeolocation';
import { SEO_CONTENT } from '@/content/seo-content';
import AnimatedCard, { AnimatedCardGrid } from '@/components/ui/AnimatedCard';
import BouncyButton from '@/components/ui/BouncyButton';
import Link from 'next/link';

export default function ContactPage() {
  const { location } = useGeolocation();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic here
    console.log('Form submitted:', formState);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title={SEO_CONTENT.contact.title}
        description={SEO_CONTENT.contact.description}
        keywords={[...SEO_CONTENT.keywords.primary, 'contact', 'demo', 'support']}
        location={location}
        structuredData={
          location.city
            ? generateLocalBusinessSchema({
                city: location.city,
                region: location.region || '',
                country: location.country || '',
              })
            : undefined
        }
        canonical="https://www.isoflux.app/contact"
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
              <Link href="/services" className="hover:text-[#4FC3F7] transition-colors">
                Services
              </Link>
              <Link href="/contact" className="text-[#4FC3F7]">
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
              {SEO_CONTENT.contact.h1}
            </H1>

            <Lead className="max-w-4xl mx-auto">
              {SEO_CONTENT.contact.intro}
            </Lead>
          </section>

          {/* Contact Methods */}
          <section>
            <H2 className="text-center mb-12">Get in Touch</H2>

            <AnimatedCardGrid columns={2} staggerDelay={0.15}>
              {SEO_CONTENT.contact.methods.map((method, index) => (
                <AnimatedCard key={index} enableTilt>
                  <H3 className="text-[#4FC3F7] mb-3">{method.title}</H3>
                  <Paragraph className="text-gray-300 mb-4">
                    {method.description}
                  </Paragraph>

                  <div className="space-y-2 text-sm">
                    {method.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Email:</span>
                        <a
                          href={`mailto:${method.email}`}
                          className="text-[#4FC3F7] hover:underline"
                        >
                          {method.email}
                        </a>
                      </div>
                    )}
                    {'phone' in method && method.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Phone:</span>
                        <a
                          href={`tel:${method.phone}`}
                          className="text-[#4FC3F7] hover:underline"
                        >
                          {method.phone}
                        </a>
                      </div>
                    )}
                    {'portal' in method && method.portal && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Portal:</span>
                        <a
                          href={method.portal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4FC3F7] hover:underline"
                        >
                          Support Portal
                        </a>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              ))}
            </AnimatedCardGrid>
          </section>

          {/* Contact Form */}
          <section>
            <AnimatedCard className="max-w-3xl mx-auto">
              <H2 className="text-center mb-8">{SEO_CONTENT.contact.form.title}</H2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF] rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    ✓
                  </div>
                  <H3 className="text-[#4FC3F7] mb-4">Thank You!</H3>
                  <Paragraph>
                    We&apos;ve received your message and will get back to you within 24 hours.
                  </Paragraph>
                  <BouncyButton
                    variant="outline"
                    size="md"
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </BouncyButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        {SEO_CONTENT.contact.form.fields.name} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#4FC3F7] transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        {SEO_CONTENT.contact.form.fields.email} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#4FC3F7] transition-colors"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-2">
                        {SEO_CONTENT.contact.form.fields.company} *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        value={formState.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#4FC3F7] transition-colors"
                        placeholder="Acme Financial"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium mb-2">
                        {SEO_CONTENT.contact.form.fields.role}
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formState.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#4FC3F7] transition-colors"
                      >
                        <option value="">Select Role</option>
                        <option value="cto">CTO</option>
                        <option value="ciso">CISO</option>
                        <option value="compliance">Compliance Officer</option>
                        <option value="engineer">Engineer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      {SEO_CONTENT.contact.form.fields.message} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formState.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#4FC3F7] transition-colors resize-none"
                      placeholder="Tell us about your compliance needs..."
                    />
                  </div>

                  <div className="text-center">
                    <BouncyButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      enableGlow
                    >
                      {SEO_CONTENT.contact.form.submit}
                    </BouncyButton>
                  </div>
                </form>
              )}
            </AnimatedCard>
          </section>

          {/* Office Locations */}
          <section>
            <H2 className="text-center mb-12">
              {SEO_CONTENT.contact.offices.title}
            </H2>

            <AnimatedCardGrid columns={3} staggerDelay={0.2}>
              {SEO_CONTENT.contact.offices.locations.map((office, index) => (
                <AnimatedCard key={index} enableGlow>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                      🌍
                    </div>
                    <H3 className="text-[#4FC3F7] mb-2">{office.city}</H3>
                    <Paragraph className="text-gray-400 text-sm mb-1">
                      {office.address}
                    </Paragraph>
                    <Paragraph className="text-gray-500 text-xs">
                      {office.description}
                    </Paragraph>
                  </div>
                </AnimatedCard>
              ))}
            </AnimatedCardGrid>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 p-8">
          <div className="max-w-7xl mx-auto text-center text-gray-400">
            <Paragraph className="text-sm">
              IsoFlux (The Compliance Wolf) | Serving Financial Institutions Worldwide
            </Paragraph>
          </div>
        </footer>
      </div>
    </>
  );
}
