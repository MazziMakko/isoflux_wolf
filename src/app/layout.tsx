import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GeolocationProvider } from '@/hooks/useGeolocation';
import { FoundationSchema } from '@/components/seo/FoundationSchema';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Wolf Shield by IsoFlux | HUD-Compliant Property Management Software',
  description: 'The only HUD property management platform with a mathematically immutable ledger. Automated recertification alerts, tamper-proof audit trails, and flat $299/mo pricing.',
  keywords: 'HUD compliance, property management, Wolf Shield, immutable ledger, HOTMA, recertification, affordable housing, subsidized housing',
  authors: [{ name: 'IsoFlux' }],
  openGraph: {
    title: 'Wolf Shield | HUD-Compliant Property Management Software',
    description: 'Pass HUD audits. Protect subsidies. $299/month flat fee. Mathematically immutable ledger.',
    type: 'website',
    url: 'https://isoflux.app',
    siteName: 'Wolf Shield by IsoFlux',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wolf Shield | HUD-Compliant Property Management',
    description: 'Pass HUD audits. Protect subsidies. $299/month flat fee.',
  },
  alternates: {
    canonical: 'https://isoflux.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <FoundationSchema />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <GeolocationProvider>
          {children}
        </GeolocationProvider>
      </body>
    </html>
  );
}
