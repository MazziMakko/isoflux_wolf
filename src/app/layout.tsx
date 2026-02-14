import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GeolocationProvider } from '@/hooks/useGeolocation';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'IsoFlux (The Compliance Wolf) | ISO 20022, Clarity Act & GENIUS Act in Milliseconds',
  description: 'IsoFlux automates ISO 20022, Clarity Act, and GENIUS Act compliance in milliseconds. The world\'s first compliance reactor for fintechs and credit unions.',
  keywords: 'ISO 20022, Clarity Act, GENIUS Act, compliance reactor, fintech, compliance automation',
  authors: [{ name: 'IsoFlux' }],
  openGraph: {
    title: 'IsoFlux (The Compliance Wolf) | Compliance in Milliseconds',
    description: 'The world\'s first compliance reactor. ISO 20022, Clarity Act, GENIUS Act—automated.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <GeolocationProvider>
          {children}
        </GeolocationProvider>
      </body>
    </html>
  );
}
