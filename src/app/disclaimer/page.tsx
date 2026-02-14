'use client';

import SEOHead from '@/components/seo/SEOHead';
import { H1, H2, Paragraph, List } from '@/components/seo/SemanticText';
import Link from 'next/link';

export default function DisclaimerPage() {
  const lastUpdated = 'January 26, 2026';

  return (
    <>
      <SEOHead
        title="Disclaimer - IsoFlux"
        description="IsoFlux Disclaimer. Important information about the use of our compliance platform and limitations."
        keywords={['disclaimer', 'legal notice', 'limitations']}
        canonical="https://www.isoflux.app/disclaimer"
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
            <H1 className="gradient-text mb-4">Disclaimer</H1>
            <Paragraph className="text-gray-400">
              Important information about the use of IsoFlux services and limitations of liability.
            </Paragraph>
          </div>

          <div className="space-y-12">
            <section>
              <H2 className="text-[#4FC3F7] mb-4">1. General Information</H2>
              <Paragraph className="text-gray-300">
                The information provided by IsoFlux ("we," "us," or "our") on www.isoflux.app (the "Site") and through our compliance platform (the "Service") is for general informational purposes only. All information on the Site and Service is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site or Service.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">2. Not Legal or Financial Advice</H2>
              <Paragraph className="text-gray-300 mb-4">
                THE INFORMATION PROVIDED BY ISOFLUX DOES NOT CONSTITUTE LEGAL, FINANCIAL, OR REGULATORY ADVICE. You should not rely on the Service as a substitute for professional legal, financial, or regulatory advice. You should always consult with qualified legal and compliance professionals regarding your specific regulatory obligations and compliance requirements.
              </Paragraph>
              <Paragraph className="text-gray-300">
                While IsoFlux provides tools for ISO 20022 validation and compliance checking, ultimate responsibility for regulatory compliance remains with you and your organization. IsoFlux does not guarantee that use of our Service will ensure compliance with all applicable laws and regulations.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">3. Accuracy of Information</H2>
              <Paragraph className="text-gray-300 mb-4">
                While we strive to provide accurate and up-to-date information, we make no warranties or representations as to the accuracy or completeness of:
              </Paragraph>
              <List className="text-gray-300 mb-4">
                <li>ISO 20022 validation results</li>
                <li>Sanctions screening data</li>
                <li>Regulatory compliance assessments</li>
                <li>Proof of reserve verifications</li>
                <li>Any other data or analysis provided by the Service</li>
              </List>
              <Paragraph className="text-gray-300">
                You acknowledge that sanctions lists, regulatory requirements, and compliance standards are subject to frequent changes, and that it is your responsibility to verify all compliance information with official sources.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">4. No Warranty of Compliance</H2>
              <Paragraph className="text-gray-300">
                IsoFlux provides tools and services to assist with compliance efforts, but DOES NOT WARRANT OR GUARANTEE that use of our Service will result in compliance with any specific laws, regulations, or industry standards including but not limited to: ISO 20022, SWIFT, SEC regulations, MiCA, OFAC sanctions, EU sanctions, AML/KYC requirements, or any other regulatory framework.
              </Paragraph>
              <Paragraph className="text-gray-300 mt-4">
                The determination of what constitutes adequate compliance is subject to interpretation by regulators and may vary by jurisdiction. You are solely responsible for ensuring your compliance with all applicable laws and regulations.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">5. External Links Disclaimer</H2>
              <Paragraph className="text-gray-300">
                The Site and Service may contain links to external websites or services that are not provided or maintained by IsoFlux. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites. The inclusion of any link does not imply endorsement by IsoFlux.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">6. Professional Disclaimer</H2>
              <Paragraph className="text-gray-300">
                The Site and Service cannot and does not contain financial, legal, or regulatory advice. The information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">7. Errors and Omissions Disclaimer</H2>
              <Paragraph className="text-gray-300">
                While we have made every attempt to ensure that the information contained in the Site and Service is correct, IsoFlux is not responsible for any errors or omissions, or for the results obtained from the use of this information. All information on the Site and Service is provided "as is", with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">8. Fair Use Disclaimer</H2>
              <Paragraph className="text-gray-300">
                IsoFlux may use copyrighted material which has not always been specifically authorized by the copyright owner. We make such material available for educational, reference, and analysis purposes. We believe this constitutes a "fair use" of any such copyrighted material as provided for in section 107 of the US Copyright Law.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">9. Views Expressed Disclaimer</H2>
              <Paragraph className="text-gray-300">
                The Site and Service may contain views and opinions which are those of IsoFlux and do not necessarily reflect the official policy or position of any other agency, organization, employer, or company. Comments published by users are their own and do not represent the views of IsoFlux.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">10. No Responsibility Disclaimer</H2>
              <Paragraph className="text-gray-300 mb-4">
                IsoFlux is not responsible for:
              </Paragraph>
              <List className="text-gray-300">
                <li>Any direct, indirect, or consequential damages arising from your use of the Service</li>
                <li>Regulatory penalties or sanctions resulting from compliance failures</li>
                <li>Financial losses due to transaction processing errors or delays</li>
                <li>Damages resulting from unauthorized access to your account</li>
                <li>Service interruptions or data loss</li>
                <li>Actions taken by third parties based on information from our Service</li>
                <li>Changes in regulatory requirements or sanctions lists</li>
              </List>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">11. Use at Your Own Risk</H2>
              <Paragraph className="text-gray-300">
                All information on the Site and Service is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site or Service. UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SITE, SERVICE, OR RELIANCE ON ANY INFORMATION PROVIDED HEREIN. YOUR USE OF THE SITE, SERVICE, AND YOUR RELIANCE ON ANY INFORMATION IS SOLELY AT YOUR OWN RISK.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">12. Regulatory Changes</H2>
              <Paragraph className="text-gray-300">
                Financial regulations, sanctions lists, and compliance requirements are subject to frequent and sometimes immediate changes. While IsoFlux makes reasonable efforts to keep our Service updated with current requirements, there may be delays between regulatory changes and Service updates. You are responsible for monitoring regulatory developments and ensuring your ongoing compliance.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">13. Third-Party Data Sources</H2>
              <Paragraph className="text-gray-300">
                IsoFlux integrates with various third-party data sources including sanctions lists, oracle services, and compliance databases. We do not control these third-party sources and are not responsible for their accuracy, availability, or timeliness. You should independently verify critical compliance information with official sources.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">14. Consent</H2>
              <Paragraph className="text-gray-300">
                By using our Site and Service, you hereby consent to our disclaimer and agree to its terms. If you do not agree with this disclaimer, you should not use our Site or Service.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">15. Update</H2>
              <Paragraph className="text-gray-300">
                Should we update, amend, or make any changes to this document, those changes will be prominently posted here with an updated "Last Updated" date.
              </Paragraph>
            </section>

            <section>
              <H2 className="text-[#4FC3F7] mb-4">16. Contact Us</H2>
              <Paragraph className="text-gray-300 mb-4">
                If you have any questions about this Disclaimer, please contact us:
              </Paragraph>
              <div className="bg-[#1a2f4a] p-6 rounded-lg border border-[#4FC3F7]/30">
                <List className="text-gray-300 list-none space-y-2">
                  <li><strong className="text-white">Email:</strong> legal@isoflux.app</li>
                  <li><strong className="text-white">Phone:</strong> +1 (XXX) XXX-XXXX</li>
                  <li><strong className="text-white">Address:</strong> [Company Address]</li>
                </List>
              </div>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <Paragraph className="text-center text-gray-400 mb-4">
              Related Legal Documents
            </Paragraph>
            <div className="flex justify-center gap-6 flex-wrap">
              <Link href="/privacy" className="text-[#4FC3F7] hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="text-[#4FC3F7] hover:underline">Terms & Conditions</Link>
              <Link href="/license" className="text-[#4FC3F7] hover:underline">License Agreement</Link>
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
