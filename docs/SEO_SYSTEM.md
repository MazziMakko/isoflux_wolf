# The Scribe & SEO Specialist - Complete Documentation

## 🎯 Overview

"The Scribe" provides a comprehensive SEO and content optimization system for IsoFlux, including:
- Dynamic meta tag management
- Geolocation-based content optimization
- Semantic HTML components
- Keyword-rich, professionally written copy
- Structured data (JSON-LD)
- Local SEO capabilities

---

## 📦 Components & Hooks

### 1. SEOHead Component

**Location**: `src/components/seo/SEOHead.tsx`

Manages all SEO meta tags dynamically.

#### Features

- Basic meta tags (title, description, keywords)
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Structured data (JSON-LD)
- Location-based optimization
- Canonical URLs
- Robots directives

#### Usage

```tsx
import SEOHead from '@/components/seo/SEOHead';

<SEOHead
  title="IsoFlux - ISO 20022 Compliance Platform"
  description="Revolutionary financial compliance platform"
  keywords={['ISO 20022', 'compliance', 'fintech']}
  location={{ city: 'New York', region: 'NY', country: 'USA' }}
  ogImage="/branding/isoflux-logo.png"
  canonical="https://www.isoflux.app"
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Page title (required) |
| `description` | string | Meta description (required) |
| `keywords` | string[] | SEO keywords |
| `ogTitle` | string | Open Graph title |
| `ogDescription` | string | Open Graph description |
| `ogImage` | string | Open Graph image URL |
| `ogUrl` | string | Open Graph URL |
| `twitterCard` | string | Twitter card type |
| `canonical` | string | Canonical URL |
| `robots` | string | Robots directive |
| `structuredData` | object | JSON-LD structured data |
| `location` | object | User location for local SEO |

#### Structured Data Helpers

```tsx
import {
  generateOrganizationSchema,
  generateSoftwareSchema,
  generateLocalBusinessSchema,
} from '@/components/seo/SEOHead';

// Organization schema
<SEOHead
  {...props}
  structuredData={generateOrganizationSchema()}
/>

// Local business schema
<SEOHead
  {...props}
  structuredData={generateLocalBusinessSchema({
    city: 'New York',
    region: 'NY',
    country: 'USA',
  })}
/>
```

---

### 2. Geolocation System

**Location**: `src/hooks/useGeolocation.tsx`

Provides IP-based geolocation for personalized content.

#### Setup

Wrap your app with the provider:

```tsx
// app/layout.tsx
import { GeolocationProvider } from '@/hooks/useGeolocation';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GeolocationProvider>
          {children}
        </GeolocationProvider>
      </body>
    </html>
  );
}
```

#### Using the Hook

```tsx
import { useGeolocation } from '@/hooks/useGeolocation';

function MyComponent() {
  const { location } = useGeolocation();

  if (location.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      Welcome from {location.city}, {location.region}!
    </div>
  );
}
```

#### Location Greeting Component

```tsx
import { LocationGreeting } from '@/hooks/useGeolocation';

<LocationGreeting className="text-lg text-blue-500" />
// Output: "Welcome, visitor from New York, NY!"
```

#### Location-Optimized Hooks

```tsx
import {
  useLocationMetaDescription,
  useLocationKeywords,
} from '@/hooks/useGeolocation';

// Auto-append location to description
const description = useLocationMetaDescription(
  'Best ISO 20022 compliance platform'
);
// Output: "Best ISO 20022 compliance platform. Serving New York, NY."

// Add location-specific keywords
const keywords = useLocationKeywords([
  'ISO 20022',
  'compliance',
]);
// Output: ['ISO 20022', 'compliance', 'ISO 20022 New York', 'ISO 20022 NY', ...]
```

#### GeolocationData Type

```typescript
interface GeolocationData {
  city?: string;           // e.g., "New York"
  region?: string;         // e.g., "NY"
  country?: string;        // e.g., "United States"
  countryCode?: string;    // e.g., "US"
  continent?: string;      // e.g., "NA"
  latitude?: number;
  longitude?: number;
  timezone?: string;       // e.g., "America/New_York"
  currency?: string;       // e.g., "USD"
  language?: string;       // e.g., "en"
  isLoading: boolean;
  error?: string;
}
```

---

### 3. Semantic Text Components

**Location**: `src/components/seo/SemanticText.tsx`

SEO-optimized, semantic HTML components.

#### Heading Components

```tsx
import { H1, H2, H3, H4, H5, H6 } from '@/components/seo/SemanticText';

<H1>Main Page Title</H1>              // text-6xl, only one per page
<H2>Major Section</H2>                 // text-5xl
<H3>Subsection</H3>                    // text-3xl
<H4>Sub-subsection</H4>                // text-2xl
<H5>Minor Section</H5>                 // text-xl
<H6>Smallest Section</H6>              // text-lg
```

**SEO Best Practice**: Use only ONE `<H1>` per page for the main title.

#### Text Components

```tsx
import {
  Paragraph,
  Lead,
  Small,
  Strong,
  Em,
  Blockquote,
  List,
  OrderedList,
} from '@/components/seo/SemanticText';

// Paragraph
<Paragraph>
  Regular paragraph text with optimal line height.
</Paragraph>

// Lead paragraph (introductory text)
<Lead>
  Larger, prominent introductory text.
</Lead>

// Small text
<Small>Terms and conditions apply</Small>

// Strong (semantic bold)
<Strong>Important information</Strong>

// Emphasis (semantic italic)
<Em>The Geometry of Value</Em>

// Blockquote
<Blockquote>
  "A non-compliant transaction cannot exist."
</Blockquote>

// Lists
<List>
  <li>Item 1</li>
  <li>Item 2</li>
</List>

<OrderedList>
  <li>First step</li>
  <li>Second step</li>
</OrderedList>
```

#### Why Semantic Components?

1. **SEO Benefits**: Search engines understand content hierarchy
2. **Accessibility**: Screen readers can navigate properly
3. **Consistency**: Uniform styling across the site
4. **Maintainability**: Easy to update styles globally

---

## 📝 SEO Content Library

**Location**: `src/content/seo-content.ts`

Centralized, keyword-rich content for all pages.

### Structure

```typescript
const SEO_CONTENT = {
  siteName: 'IsoFlux',
  tagline: 'The Geometry of Value',
  keywords: {
    primary: [...],
    secondary: [...],
    technical: [...],
  },
  home: { ... },
  about: { ... },
  services: { ... },
  contact: { ... },
  faq: { ... },
};
```

### Using Content

```tsx
import { SEO_CONTENT } from '@/content/seo-content';

<SEOHead
  title={SEO_CONTENT.home.title}
  description={SEO_CONTENT.home.description}
  keywords={SEO_CONTENT.keywords.primary}
/>

<H1>{SEO_CONTENT.home.h1}</H1>
<Paragraph>{SEO_CONTENT.home.hero.description}</Paragraph>
```

### Location-Specific Content

```tsx
import { getLocationContent, getLocationKeywords } from '@/content/seo-content';

const localizedDescription = getLocationContent(
  'Best ISO 20022 platform',
  { city: 'New York', region: 'NY' }
);
// Output: "Best ISO 20022 platform. Proudly serving financial institutions in New York, NY."

const localKeywords = getLocationKeywords(
  ['ISO 20022', 'compliance'],
  { city: 'New York', region: 'NY' }
);
// Output: ['ISO 20022', 'ISO 20022 New York', 'ISO 20022 NY', 'compliance', ...]
```

---

## 🎯 SEO Best Practices

### 1. Page Structure

```tsx
// Every page should follow this structure:
export default function Page() {
  const { location } = useGeolocation();

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Unique Page Title - IsoFlux"
        description="Compelling 150-160 character description"
        keywords={['keyword1', 'keyword2', 'keyword3']}
        location={location}
      />

      {/* Content */}
      <H1>One Main Title Per Page</H1>
      <Lead>Introductory paragraph</Lead>
      
      <H2>First Major Section</H2>
      <Paragraph>Content...</Paragraph>
      
      <H3>Subsection</H3>
      <Paragraph>More content...</Paragraph>
    </>
  );
}
```

### 2. Title Tags

**Format**: `Primary Keyword - Secondary Keyword | Brand`

```typescript
// Good
title: "ISO 20022 Compliance Platform | IsoFlux"
title: "Financial Sanctions Screening - OFAC Compliance | IsoFlux"
title: "About IsoFlux - Geometric Validation Technology"

// Bad (too short)
title: "IsoFlux"

// Bad (keyword stuffing)
title: "ISO 20022 Compliance Platform ISO 20022 Validator ISO 20022 Parser"
```

**Length**: 50-60 characters ideal, max 70

### 3. Meta Descriptions

**Format**: Compelling summary with primary keywords, call-to-action

```typescript
// Good (158 characters)
description: "Revolutionary ISO 20022 compliance platform using geometric validation. Eliminate financial violations with 99.99% uptime. Request demo today."

// Bad (too short)
description: "IsoFlux is a compliance platform."

// Bad (no CTA)
description: "We offer ISO 20022 compliance services."
```

**Length**: 150-160 characters

### 4. Keywords

**Primary Keywords**: 3-5 most important terms
**Secondary Keywords**: 5-10 supporting terms

```typescript
keywords: {
  primary: [
    'ISO 20022 compliance',      // High volume, high intent
    'financial compliance platform',
    'sanctions screening',
  ],
  secondary: [
    'OFAC compliance',            // Lower volume, specific
    'MiCA regulation',
    'payment validation',
  ],
}
```

### 5. Heading Hierarchy

```tsx
<H1>Main Page Topic</H1>          // Only ONE per page

<H2>Major Section 1</H2>
  <H3>Subsection 1.1</H3>
  <H3>Subsection 1.2</H3>

<H2>Major Section 2</H2>
  <H3>Subsection 2.1</H3>
    <H4>Detail 2.1.1</H4>
```

**Never skip levels** (e.g., don't go from H2 to H4)

### 6. Content Quality

**Keyword Density**: 1-2% (natural integration)

```tsx
// Good (natural)
<Paragraph>
  IsoFlux provides ISO 20022 compliance through geometric validation.
  Our platform ensures financial institutions meet regulatory requirements
  with zero violations.
</Paragraph>

// Bad (keyword stuffing)
<Paragraph>
  ISO 20022 compliance ISO 20022 validator ISO 20022 platform ISO 20022...
</Paragraph>
```

**Word Count**:
- Home page: 800-1200 words
- About page: 600-800 words
- Service pages: 1000-1500 words
- Blog posts: 1500-2500 words

### 7. Internal Linking

```tsx
<Paragraph>
  Learn more about our <Link href="/services">ISO 20022 validation services</Link>
  or <Link href="/contact">schedule a demo</Link>.
</Paragraph>
```

**Benefits**:
- Improves page authority
- Helps search engines understand site structure
- Keeps users on site longer

### 8. Structured Data

Always include appropriate schema:

```tsx
// Home page
<SEOHead structuredData={generateOrganizationSchema()} />

// Services page
<SEOHead structuredData={generateSoftwareSchema()} />

// Location-specific page
<SEOHead structuredData={generateLocalBusinessSchema({
  city: 'New York',
  region: 'NY',
  country: 'USA',
})} />
```

---

## 🌍 Local SEO

### City-Specific Pages

Create dedicated pages for major markets:

```
/new-york
/london
/singapore
/hong-kong
```

Each page should:
1. Use location in title: `"ISO 20022 Compliance in New York | IsoFlux"`
2. Include location in H1: `"ISO 20022 Compliance Services in New York"`
3. Mention location 3-5 times naturally in content
4. Include local business schema
5. Reference local landmarks/institutions

### Dynamic Location Content

```tsx
import { useGeolocation, useLocationMetaDescription } from '@/hooks/useGeolocation';
import { getLocationContent } from '@/content/seo-content';

function LocalizedPage() {
  const { location } = useGeolocation();
  
  const description = useLocationMetaDescription(
    'Professional ISO 20022 compliance services'
  );
  
  const content = getLocationContent(
    'We serve financial institutions worldwide',
    location
  );

  return (
    <>
      <SEOHead
        title={`Services${location.city ? ` in ${location.city}` : ''}`}
        description={description}
        location={location}
      />
      
      <H1>
        Services{location.city && ` in ${location.city}`}
      </H1>
      
      <Paragraph>{content}</Paragraph>
    </>
  );
}
```

---

## 📊 Performance & Technical SEO

### Page Speed

All components are optimized for performance:
- Minimal JavaScript
- No layout shift
- GPU-accelerated animations
- Lazy loading for images

### Mobile Optimization

- Responsive typography
- Touch-friendly buttons
- Mobile-first design

### Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Screen reader friendly

---

## ✅ SEO Checklist

### Every Page Should Have:

- [ ] Unique, keyword-rich title (50-60 chars)
- [ ] Compelling meta description (150-160 chars)
- [ ] 3-5 relevant keywords
- [ ] ONE H1 tag with primary keyword
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] 800+ words of quality content
- [ ] Internal links to related pages
- [ ] Structured data (JSON-LD)
- [ ] Canonical URL
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Mobile-responsive design
- [ ] Fast load time (<3s)
- [ ] HTTPS enabled

---

## 📈 Monitoring & Analytics

### Recommended Tools

1. **Google Search Console**: Track search performance
2. **Google Analytics**: Monitor traffic and user behavior
3. **Ahrefs/SEMrush**: Keyword research and backlink analysis
4. **PageSpeed Insights**: Performance monitoring

### Key Metrics to Track

- Organic search traffic
- Keyword rankings
- Click-through rate (CTR)
- Bounce rate
- Time on page
- Conversion rate
- Page load speed
- Core Web Vitals

---

## 🚀 Quick Start

1. **Install dependencies** (already installed):
   ```bash
   npm install
   ```

2. **Wrap app with GeolocationProvider**:
   ```tsx
   // app/layout.tsx
   import { GeolocationProvider } from '@/hooks/useGeolocation';
   
   export default function RootLayout({ children }) {
     return (
       <GeolocationProvider>
         {children}
       </GeolocationProvider>
     );
   }
   ```

3. **Use in pages**:
   ```tsx
   import SEOHead from '@/components/seo/SEOHead';
   import { H1, Paragraph } from '@/components/seo/SemanticText';
   import { useGeolocation } from '@/hooks/useGeolocation';
   import { SEO_CONTENT } from '@/content/seo-content';
   
   export default function Page() {
     const { location } = useGeolocation();
     
     return (
       <>
         <SEOHead
           title={SEO_CONTENT.home.title}
           description={SEO_CONTENT.home.description}
           location={location}
         />
         
         <H1>{SEO_CONTENT.home.h1}</H1>
         <Paragraph>{SEO_CONTENT.home.hero.description}</Paragraph>
       </>
     );
   }
   ```

---

**Built by**: The Scribe & SEO Specialist  
**Version**: 1.0.0  
**Status**: Production Ready ✅
