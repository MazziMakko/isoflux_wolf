'use client';

import SEOHead from '@/components/seo/SEOHead';
import { H1, H2, H3, Paragraph, List } from '@/components/seo/SemanticText';
import Link from 'next/link';

export default function LicensePage() {
  const lastUpdated = 'January 26, 2026';

  return (
    <>
      <SEOHead
        title="License Agreement - IsoFlux"
        description="IsoFlux Software License Agreement. Terms for using our ISO 20022 compliance platform."
        keywords={['license agreement', 'software license', 'EULA']}
        canonical="https://www.isoflux.app/license"
      />

      <div className="min-h-screen bg-[#0a1628] text-white">
        <header className="border-b border-white/10 bg-[#0d1f3a]/95 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <Link href="/isoflux" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/branding/isoflux-logo.png" alt="IsoFlux" className="w-10 h-10" />
              <span className="text-2xl font-bold">IsoFlux</span>
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/isoflux" className="hover:text-[#4FC3F7] transition-colors">Home</Link>
              <Link href="/contact" className="hover:text-[#4FC3F7] transition-colors">Contact</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-8 py-16">
          <div className="mb-8 text-center">
            <div className="inline-block px-6 py-2 bg-[#1a2f4a] rounded-full text-sm text-[#4FC3F7] border border-[#4FC3F7]/30">
              Last Updated: {lastUpdated}
            </div>
          </div>

          <div className="text-center mb-16">
            <H1 className="gradient-text mb-4">End User License Agreement</H1>
            <Paragraph className="text-gray-400">
              Software License Agreement for IsoFlux Compliance Platform
            </Paragraph>
          </div>

          <div className="space-y-12">
            <section>
              <H2 className="text-[#4FC3F7] mb-4">1. License Grant</H2>
              <Paragraph className="text-gray-300">
                Subject to the terms of this Agreement, IsoFlux grants you a limited, non-exclusive, non-transferable, revocable license to access and use the IsoFlux compliance platform solely for your internal business purposes in accordance with your subscription plan.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">2. License Types</H2>
              
              <H3 className="text-white mb-3">2.1 Standard License</H3>
              <Paragraph className="text-gray-300 mb-4">
                Individual users or small teams. Limited to specified number of users and transaction volume.
              </Paragraph>

              <H3 className="text-white mb-3">2.2 Enterprise License</H3>
              <Paragraph className="text-gray-300 mb-4">
                Large organizations with unlimited users, custom integrations, SLA guarantees, and dedicated support.
              </Paragraph>

              <H3 className="text-white mb-3">2.3 White Label License</H3>
              <Paragraph className="text-gray-300">
                Resellers and partners with custom branding rights. Separate agreement required.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">3. Restrictions</H2>
              <Paragraph className="text-gray-300 mb-4">
                You shall not:
              </Paragraph>
              <List className="text-gray-300">
                <li>Reverse engineer, decompile, or disassemble the Software</li>
                <li>Modify, adapt, translate, or create derivative works</li>
                <li>Rent, lease, loan, resell, or sublicense the Software</li>
                <li>Remove or alter any proprietary notices or labels</li>
                <li>Use the Software for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any systems</li>
                <li>Share your account credentials with unauthorized users</li>
                <li>Exceed your licensed user count or transaction volume</li>
              </List>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">4. Intellectual Property</H2>
              <Paragraph className="text-gray-300">
                IsoFlux and its licensors retain all right, title, and interest in and to the Software, including all intellectual property rights. This Agreement does not grant you any rights to trademarks, service marks, or trade names of IsoFlux. You retain all rights to your data processed through the Software.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">5. Support and Updates</H2>
              <Paragraph className="text-gray-300">
                IsoFlux will provide software updates, bug fixes, and technical support in accordance with your subscription plan. Enterprise customers receive priority support with guaranteed response times.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">6. Termination</H2>
              <Paragraph className="text-gray-300">
                This license is effective until terminated. Your rights under this license will terminate automatically without notice if you fail to comply with any term. Upon termination, you must cease all use of the Software and destroy all copies in your possession.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">7. Warranty Disclaimer</H2>
              <Paragraph className="text-gray-300">
                THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. ISOFLUX DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">8. Limitation of Liability</H2>
              <Paragraph className="text-gray-300">
                IN NO EVENT SHALL ISOFLUX BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE USE OF THE SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">9. Compliance</H2>
              <Paragraph className="text-gray-300">
                You are responsible for ensuring your use of the Software complies with all applicable laws and regulations. IsoFlux provides tools to assist with compliance but does not guarantee compliance with any specific regulatory framework.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">10. Contact</H2>
              <div className="bg-[#1a2f4a] p-6 rounded-lg border border-[#4FC3F7]/30">
                <List className="text-gray-300 list-none space-y-2">
                  <li><strong className="text-white">Email:</strong> licensing@isoflux.app</li>
                  <li><strong className="text-white">Phone:</strong> +1 (XXX) XXX-XXXX</li>
                </List>
              </div>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <Paragraph className="text-center text-gray-400 mb-4">Related Legal Documents</Paragraph>
            <div className="flex justify-center gap-6 flex-wrap">
              <Link href="/privacy" className="text-[#4FC3F7] hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="text-[#4FC3F7] hover:underline">Terms & Conditions</Link>
              <Link href="/disclaimer" className="text-[#4FC3F7] hover:underline">Disclaimer</Link>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 py-8 bg-[#0d1f3a]">
          <div className="max-w-7xl mx-auto px-8 text-center text-gray-400 text-sm">
            <Paragraph>© 2026 IsoFlux. All rights reserved. | The Compliance Wolf</Paragraph>
          </div>
        </footer>
      </div>
    </>
  );
}
