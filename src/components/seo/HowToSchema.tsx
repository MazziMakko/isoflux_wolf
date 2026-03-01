/**
 * =====================================================
 * WOLF SHIELD: HOW-TO JSON-LD SCHEMA
 * HUD Compliance Audit Guide
 * Purpose: Capture "How-To" rich snippets and demonstrate E-E-A-T
 * =====================================================
 */

export function HowToSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Perform a HUD Compliance Audit with IsoFlux Wolf Shield",
    "description": "A step-by-step guide to ensuring your multi-family property meets HUD regulatory standards using the IsoFlux PWA.",
    "image": "https://isoflux.app/images/hud-audit-guide.jpg",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "totalTime": "PT20M",
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "IsoFlux.app Subscription"
      },
      {
        "@type": "HowToSupply",
        "name": "Property Resident Files"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Wolf Shield Compliance Engine"
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "url": "https://isoflux.app/guides/hud-audit#step1",
        "name": "Initialize Wolf Shield Scan",
        "itemListElement": [{
          "@type": "HowToDirection",
          "text": "Log into your IsoFlux dashboard and select 'Start New Compliance Audit' to activate the Wolf Shield engine."
        }]
      },
      {
        "@type": "HowToStep",
        "url": "https://isoflux.app/guides/hud-audit#step2",
        "name": "Data Integrity Verification",
        "itemListElement": [{
          "@type": "HowToDirection",
          "text": "Upload your tenant certification data. IsoFlux cross-references your files against the latest HUD income limits and passbook rates."
        }]
      },
      {
        "@type": "HowToStep",
        "url": "https://isoflux.app/guides/hud-audit#step3",
        "name": "Generate HUD-Ready Report",
        "itemListElement": [{
          "@type": "HowToDirection",
          "text": "Review the flagged discrepancies, correct them within the app, and export your final HUD-compliant audit report using the Auditor's Briefcase feature with cryptographic verification."
        }]
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
