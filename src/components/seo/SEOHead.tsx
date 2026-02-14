'use client';

import { useEffect } from 'react';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  canonical?: string;
  robots?: string;
  structuredData?: Record<string, unknown>;
}

interface SEOHeadProps extends SEOMetadata {
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
}

/**
 * SEOHead Component
 * 
 * Manages all meta tags for SEO optimization including:
 * - Basic meta tags (title, description, keywords)
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Structured data (JSON-LD)
 * - Dynamic location-based optimization
 * 
 * @example
 * ```tsx
 * <SEOHead
 *   title="IsoFlux - Financial Compliance Platform"
 *   description="Revolutionary ISO 20022 compliance platform"
 *   keywords={['ISO 20022', 'compliance', 'fintech']}
 *   location={{ city: 'New York', region: 'NY', country: 'USA' }}
 * />
 * ```
 */
export default function SEOHead({
  title,
  description,
  keywords = [],
  ogTitle,
  ogDescription,
  ogImage = '/branding/isoflux-logo.png',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterSite = '@isoflux',
  twitterCreator = '@isoflux',
  canonical,
  robots = 'index, follow',
  structuredData,
  location,
}: SEOHeadProps) {
  // Enhance description with location if provided
  const enhancedDescription = location
    ? `${description} Serving ${location.city ? `${location.city}, ` : ''}${location.region || location.country || 'globally'}.`
    : description;

  // Enhance title with location for local SEO
  const enhancedTitle = location && location.city
    ? `${title} | ${location.city}, ${location.region || location.country}`
    : title;

  useEffect(() => {
    // Update document title
    document.title = enhancedTitle;

    // Update or create meta tags
    updateMetaTag('description', enhancedDescription);
    
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Open Graph tags
    updateMetaTag('og:title', ogTitle || enhancedTitle, 'property');
    updateMetaTag('og:description', ogDescription || enhancedDescription, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:type', 'website', 'property');
    
    if (ogUrl) {
      updateMetaTag('og:url', ogUrl, 'property');
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', twitterCard);
    updateMetaTag('twitter:site', twitterSite);
    updateMetaTag('twitter:creator', twitterCreator);
    updateMetaTag('twitter:title', ogTitle || enhancedTitle);
    updateMetaTag('twitter:description', ogDescription || enhancedDescription);
    updateMetaTag('twitter:image', ogImage);

    // Robots
    updateMetaTag('robots', robots);

    // Canonical URL
    if (canonical) {
      updateLinkTag('canonical', canonical);
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      updateStructuredData(structuredData);
    }
  }, [
    enhancedTitle,
    enhancedDescription,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    twitterCard,
    twitterSite,
    twitterCreator,
    canonical,
    robots,
    structuredData,
  ]);

  return null; // This component doesn't render anything visible
}

/**
 * Helper function to update or create meta tags
 */
function updateMetaTag(
  name: string,
  content: string,
  attribute: 'name' | 'property' = 'name'
) {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

/**
 * Helper function to update or create link tags
 */
function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  
  element.href = href;
}

/**
 * Helper function to add structured data (JSON-LD)
 */
function updateStructuredData(data: Record<string, unknown>) {
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  
  if (existingScript) {
    existingScript.textContent = JSON.stringify(data);
  } else {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
}

/**
 * Generate structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IsoFlux',
    description: 'IsoFlux (The Compliance Wolf)—ISO 20022, Clarity Act & GENIUS Act compliance in milliseconds.',
    url: 'https://www.isoflux.app',
    logo: 'https://www.isoflux.app/branding/isoflux-logo.png',
    sameAs: [
      'https://twitter.com/isoflux',
      'https://linkedin.com/company/isoflux',
      'https://github.com/isoflux',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'customer service',
      email: 'support@isoflux.app',
      areaServed: 'Worldwide',
      availableLanguage: ['English'],
    },
  };
}

/**
 * Generate structured data for Software Application
 */
export function generateSoftwareSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'IsoFlux',
    applicationCategory: 'FinanceTech',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      ratingCount: '100',
    },
  };
}

/**
 * Generate location-specific structured data
 */
export function generateLocalBusinessSchema(location: {
  city: string;
  region: string;
  country: string;
  address?: string;
  postalCode?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `IsoFlux - ${location.city}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.city,
      addressRegion: location.region,
      addressCountry: location.country,
      streetAddress: location.address || '',
      postalCode: location.postalCode || '',
    },
    description: `ISO 20022 compliance and financial infrastructure services in ${location.city}, ${location.region}`,
    url: 'https://www.isoflux.app',
  };
}
