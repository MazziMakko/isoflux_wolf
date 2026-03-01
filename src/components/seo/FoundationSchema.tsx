/**
 * =====================================================
 * WOLF SHIELD: FOUNDATION JSON-LD SCHEMA
 * Organization + WebApplication + FAQ
 * Purpose: Establish IsoFlux.app as authoritative HUD compliance platform
 * =====================================================
 */

export function FoundationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://isoflux.app/#organization",
        "name": "IsoFlux",
        "url": "https://isoflux.app",
        "logo": "https://isoflux.app/logo.png",
        "foundingDate": "2026",
        "description": "Advanced HUD compliance and property management solutions featuring the Wolf Shield HUD compliance engine.",
        "sameAs": [
          "https://linkedin.com/company/isoflux",
          "https://twitter.com/isofluxapp"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@isoflux.app",
          "contactType": "customer service"
        }
      },
      {
        "@type": "WebApplication",
        "@id": "https://isoflux.app/#software",
        "name": "IsoFlux Property Manager",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "299",
          "priceCurrency": "USD",
          "description": "Subscription-based HUD compliance management - $299/month flat fee, unlimited units"
        },
        "featureList": [
          "Wolf Shield HUD Compliance Engine",
          "Real-time HUD Inspection Readiness",
          "Automated Compliance Reporting",
          "Secure Document Management",
          "Append-Only Immutable Ledger",
          "90-60-30 Day Recertification Alerts"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://isoflux.app/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does IsoFlux ensure HUD compliance?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "IsoFlux utilizes the proprietary Wolf Shield HUD compliance engine to automate reporting and ensure all property data meets current HUD regulatory standards. The system features a mathematically immutable append-only ledger that prevents any historical data modification."
            }
          },
          {
            "@type": "Question",
            "name": "Is IsoFlux compatible with HOTMA regulations?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, IsoFlux is fully updated to support HOTMA final rule requirements, including 2026 inflationary adjustments and passbook savings rates."
            }
          },
          {
            "@type": "Question",
            "name": "What makes the Wolf Shield ledger tamper-proof?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Wolf Shield ledger uses cryptographic hash chains and database-level triggers that physically prevent deletion or modification of historical records. All corrections must be made through offsetting adjustment entries, ensuring a complete audit trail."
            }
          },
          {
            "@type": "Question",
            "name": "How much does IsoFlux cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "IsoFlux charges a flat $299/month with no per-unit fees. Manage 10 units or 1,000 units for the same price. Includes a 30-day free trial with no credit card required."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
