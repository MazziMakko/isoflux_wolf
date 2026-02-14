'use client';

import SEOHead from '@/components/seo/SEOHead';
import { H1, H2, H3, Paragraph, List } from '@/components/seo/SemanticText';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 26, 2026';

  return (
    <>
      <SEOHead
        title="Privacy Policy - IsoFlux"
        description="IsoFlux Privacy Policy. Learn how we collect, use, and protect your personal information."
        keywords={['privacy policy', 'data protection', 'GDPR', 'CCPA']}
        canonical="https://www.isoflux.app/privacy"
      />

      <div className="min-h-screen bg-[#0a1628] text-white">
        {/* Header */}
        <header className="border-b border-white/10 bg-[#0d1f3a]/95 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <Link href="/isoflux" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/branding/isoflux-logo.png"
                alt="IsoFlux"
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold">IsoFlux</span>
            </Link>

            <nav className="flex gap-6 text-sm">
              <Link href="/isoflux" className="hover:text-[#4FC3F7] transition-colors">
                Home
              </Link>
              <Link href="/contact" className="hover:text-[#4FC3F7] transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-8 py-16">
          {/* Last Updated */}
          <div className="mb-8 text-center">
            <div className="inline-block px-6 py-2 bg-[#1a2f4a] rounded-full text-sm text-[#4FC3F7] border border-[#4FC3F7]/30">
              Last Updated: {lastUpdated}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-16">
            <H1 className="gradient-text mb-4">Privacy Policy</H1>
            <Paragraph className="text-gray-400">
              Your privacy is critically important to us. This Privacy Policy explains how IsoFlux collects, uses, and protects your information.
            </Paragraph>
          </div>

          {/* Content */}
          <div className="space-y-12">
            {/* Introduction */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">1. Introduction</H2>
              <Paragraph className="text-gray-300">
                IsoFlux ("we", "our", or "us") operates www.isoflux.app and related services (the "Service"). This Privacy Policy informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </Paragraph>
              <Paragraph className="text-gray-300">
                We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms and Conditions.
              </Paragraph>
            </section>

            {/* Information Collection */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">2. Information Collection and Use</H2>
              
              <H3 className="text-white mb-3">2.1 Personal Data</H3>
              <Paragraph className="text-gray-300 mb-4">
                While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:
              </Paragraph>
              <List className="text-gray-300 mb-6">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Company name and business information</li>
                <li>Phone number</li>
                <li>Address, State, Province, ZIP/Postal code, City</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Cookies and Usage Data</li>
              </List>

              <H3 className="text-white mb-3">2.2 Usage Data</H3>
              <Paragraph className="text-gray-300 mb-4">
                We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include:
              </Paragraph>
              <List className="text-gray-300 mb-6">
                <li>Your computer's Internet Protocol address (e.g., IP address)</li>
                <li>Browser type and version</li>
                <li>Pages of our Service that you visit</li>
                <li>Time and date of your visit</li>
                <li>Time spent on those pages</li>
                <li>Unique device identifiers</li>
                <li>Diagnostic data</li>
              </List>

              <H3 className="text-white mb-3">2.3 Financial Transaction Data</H3>
              <Paragraph className="text-gray-300">
                For ISO 20022 transaction processing and compliance services, we collect and process financial transaction data. This data is subject to strict security measures and is processed in accordance with applicable financial regulations including SOC 2 Type II, PCI DSS, and banking security standards.
              </Paragraph>
            </section>

            {/* Tracking & Cookies */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">3. Tracking & Cookies Data</H2>
              <Paragraph className="text-gray-300 mb-4">
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
              </Paragraph>
              <Paragraph className="text-gray-300 mb-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </Paragraph>
              <Paragraph className="text-gray-300 mb-4">
                Examples of Cookies we use:
              </Paragraph>
              <List className="text-gray-300">
                <li><strong>Session Cookies</strong>: We use Session Cookies to operate our Service</li>
                <li><strong>Preference Cookies</strong>: We use Preference Cookies to remember your preferences and various settings</li>
                <li><strong>Security Cookies</strong>: We use Security Cookies for security purposes</li>
              </List>
            </section>

            {/* Use of Data */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">4. Use of Data</H2>
              <Paragraph className="text-gray-300 mb-4">
                IsoFlux uses the collected data for various purposes:
              </Paragraph>
              <List className="text-gray-300">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features when you choose to do so</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
                <li>To provide ISO 20022 compliance validation and sanctions screening services</li>
                <li>To fulfill regulatory and compliance obligations</li>
                <li>To process financial transactions securely</li>
              </List>
            </section>

            {/* Data Retention */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">5. Data Retention</H2>
              <Paragraph className="text-gray-300">
                IsoFlux will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
              </Paragraph>
              <Paragraph className="text-gray-300">
                For financial transaction data, we maintain records in accordance with banking regulations and compliance requirements, which may require retention for up to 7 years or longer as required by law.
              </Paragraph>
            </section>

            {/* Data Transfer */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">6. Transfer of Data</H2>
              <Paragraph className="text-gray-300">
                Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.
              </Paragraph>
              <Paragraph className="text-gray-300">
                Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer. IsoFlux will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy.
              </Paragraph>
            </section>

            {/* Disclosure of Data */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">7. Disclosure of Data</H2>
              
              <H3 className="text-white mb-3">7.1 Legal Requirements</H3>
              <Paragraph className="text-gray-300 mb-4">
                IsoFlux may disclose your Personal Data in the good faith belief that such action is necessary to:
              </Paragraph>
              <List className="text-gray-300 mb-6">
                <li>Comply with a legal obligation</li>
                <li>Protect and defend the rights or property of IsoFlux</li>
                <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                <li>Protect the personal safety of users of the Service or the public</li>
                <li>Protect against legal liability</li>
              </List>

              <H3 className="text-white mb-3">7.2 Regulatory Compliance</H3>
              <Paragraph className="text-gray-300">
                As a financial compliance platform, we may be required to disclose transaction data to regulatory authorities including SEC, CFTC, FinCEN, OFAC, and other financial regulators. All such disclosures will be made in accordance with applicable laws and regulations.
              </Paragraph>
            </section>

            {/* Security */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">8. Security of Data</H2>
              <Paragraph className="text-gray-300">
                The security of your data is important to us. We implement industry-standard security measures including:
              </Paragraph>
              <List className="text-gray-300 mb-4">
                <li><strong>Encryption</strong>: All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li><strong>Hardware Security Modules (HSM)</strong>: Cryptographic keys stored in tamper-resistant hardware</li>
                <li><strong>Mutual TLS (mTLS)</strong>: Certificate-based authentication for all API connections</li>
                <li><strong>Access Controls</strong>: Role-based access control (RBAC) and row-level security (RLS)</li>
                <li><strong>Audit Logging</strong>: Comprehensive logging of all data access and modifications</li>
                <li><strong>Regular Security Audits</strong>: Third-party penetration testing and security assessments</li>
                <li><strong>SOC 2 Type II Compliance</strong>: Annual audits of security controls</li>
              </List>
              <Paragraph className="text-gray-300">
                However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </Paragraph>
            </section>

            {/* GDPR */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">9. Your Data Protection Rights (GDPR)</H2>
              <Paragraph className="text-gray-300 mb-4">
                If you are a resident of the European Economic Area (EEA), you have certain data protection rights. IsoFlux aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
              </Paragraph>
              <Paragraph className="text-gray-300 mb-4">
                You have the following data protection rights:
              </Paragraph>
              <List className="text-gray-300">
                <li><strong>Right to Access</strong>: You have the right to request copies of your personal data</li>
                <li><strong>Right to Rectification</strong>: You have the right to request correction of inaccurate data</li>
                <li><strong>Right to Erasure</strong>: You have the right to request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing</strong>: You have the right to request restriction of processing</li>
                <li><strong>Right to Data Portability</strong>: You have the right to receive your data in a structured format</li>
                <li><strong>Right to Object</strong>: You have the right to object to our processing of your personal data</li>
              </List>
            </section>

            {/* CCPA */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">10. California Privacy Rights (CCPA)</H2>
              <Paragraph className="text-gray-300 mb-4">
                If you are a California resident, you have specific rights regarding your personal information under the California Consumer Privacy Act (CCPA):
              </Paragraph>
              <List className="text-gray-300">
                <li><strong>Right to Know</strong>: You can request information about the personal data we collect</li>
                <li><strong>Right to Delete</strong>: You can request deletion of your personal information</li>
                <li><strong>Right to Opt-Out</strong>: You can opt-out of the sale of your personal information (we do not sell personal information)</li>
                <li><strong>Right to Non-Discrimination</strong>: We will not discriminate against you for exercising your CCPA rights</li>
              </List>
            </section>

            {/* Service Providers */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">11. Service Providers</H2>
              <Paragraph className="text-gray-300 mb-4">
                We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used. These third parties include:
              </Paragraph>
              <List className="text-gray-300">
                <li><strong>Payment Processing</strong>: Stripe (for payment processing)</li>
                <li><strong>Database Hosting</strong>: Supabase (for secure data storage)</li>
                <li><strong>Infrastructure</strong>: Digital Ocean (for application hosting)</li>
                <li><strong>Analytics</strong>: Google Analytics (for usage analytics)</li>
                <li><strong>Email Services</strong>: SendGrid (for transactional emails)</li>
                <li><strong>Compliance Services</strong>: Chainlink (for oracle data), Various sanctions list providers</li>
              </List>
              <Paragraph className="text-gray-300 mt-4">
                These third parties have access to your Personal Data only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </Paragraph>
            </section>

            {/* Links to Other Sites */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">12. Links to Other Sites</H2>
              <Paragraph className="text-gray-300">
                Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </Paragraph>
            </section>

            {/* Children's Privacy */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">13. Children's Privacy</H2>
              <Paragraph className="text-gray-300">
                Our Service is not intended for use by children under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
              </Paragraph>
            </section>

            {/* Changes to Policy */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">14. Changes to This Privacy Policy</H2>
              <Paragraph className="text-gray-300">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
              </Paragraph>
              <Paragraph className="text-gray-300">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </Paragraph>
            </section>

            {/* Contact Us */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">15. Contact Us</H2>
              <Paragraph className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </Paragraph>
              <div className="bg-[#1a2f4a] p-6 rounded-lg border border-[#4FC3F7]/30">
                <List className="text-gray-300 list-none space-y-2">
                  <li><strong className="text-white">Email:</strong> privacy@isoflux.app</li>
                  <li><strong className="text-white">Phone:</strong> +1 (XXX) XXX-XXXX</li>
                  <li><strong className="text-white">Address:</strong> [Company Address]</li>
                  <li><strong className="text-white">Data Protection Officer:</strong> dpo@isoflux.app</li>
                </List>
              </div>
            </section>
          </div>

          {/* Other Legal Pages */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <Paragraph className="text-center text-gray-400 mb-4">
              Related Legal Documents
            </Paragraph>
            <div className="flex justify-center gap-6 flex-wrap">
              <Link href="/terms" className="text-[#4FC3F7] hover:underline">
                Terms & Conditions
              </Link>
              <Link href="/disclaimer" className="text-[#4FC3F7] hover:underline">
                Disclaimer
              </Link>
              <Link href="/license" className="text-[#4FC3F7] hover:underline">
                License Agreement
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 bg-[#0d1f3a]">
          <div className="max-w-7xl mx-auto px-8 text-center text-gray-400 text-sm">
            <Paragraph>
              © 2026 IsoFlux. All rights reserved. | The Compliance Wolf
            </Paragraph>
          </div>
        </footer>
      </div>
    </>
  );
}
