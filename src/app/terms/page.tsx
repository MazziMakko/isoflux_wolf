'use client';

import SEOHead from '@/components/seo/SEOHead';
import { H1, H2, H3, Paragraph, List } from '@/components/seo/SemanticText';
import Link from 'next/link';

export default function TermsPage() {
  const lastUpdated = 'January 26, 2026';

  return (
    <>
      <SEOHead
        title="Terms and Conditions - IsoFlux"
        description="IsoFlux Terms and Conditions. Legal terms governing your use of our ISO 20022 compliance platform."
        keywords={['terms and conditions', 'legal agreement', 'terms of service']}
        canonical="https://www.isoflux.app/terms"
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
            <H1 className="gradient-text mb-4">Terms and Conditions</H1>
            <Paragraph className="text-gray-400">
              Please read these terms and conditions carefully before using IsoFlux services.
            </Paragraph>
          </div>

          {/* Content */}
          <div className="space-y-12">
            {/* Introduction */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">1. Agreement to Terms</H2>
              <Paragraph className="text-gray-300">
                These Terms and Conditions ("Terms", "Terms and Conditions") govern your relationship with www.isoflux.app website and related services (the "Service") operated by IsoFlux ("us", "we", or "our").
              </Paragraph>
              <Paragraph className="text-gray-300">
                Please read these Terms and Conditions carefully before using our Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</strong>
              </Paragraph>
            </section>

            {/* Accounts */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">2. Accounts</H2>
              
              <H3 className="text-white mb-3">2.1 Account Creation</H3>
              <Paragraph className="text-gray-300 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </Paragraph>

              <H3 className="text-white mb-3">2.2 Account Security</H3>
              <Paragraph className="text-gray-300 mb-4">
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
              </Paragraph>
              <Paragraph className="text-gray-300 mb-4">
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </Paragraph>

              <H3 className="text-white mb-3">2.3 Enterprise Accounts</H3>
              <Paragraph className="text-gray-300">
                For enterprise and institutional accounts, additional terms may apply as specified in your Enterprise License Agreement. Enterprise accounts may have enhanced security requirements including multi-factor authentication (MFA), hardware security key requirements, and IP whitelisting.
              </Paragraph>
            </section>

            {/* Service Use */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">3. Use of Service</H2>
              
              <H3 className="text-white mb-3">3.1 Permitted Use</H3>
              <Paragraph className="text-gray-300 mb-4">
                IsoFlux grants you a limited, non-exclusive, non-transferable, and revocable license to use the Service for:
              </Paragraph>
              <List className="text-gray-300 mb-6">
                <li>ISO 20022 message validation and compliance checking</li>
                <li>Financial transaction processing and sanctions screening</li>
                <li>Regulatory compliance reporting and attestations</li>
                <li>Proof of reserves verification</li>
                <li>Other compliance-related activities as described in the Service documentation</li>
              </List>

              <H3 className="text-white mb-3">3.2 Prohibited Use</H3>
              <Paragraph className="text-gray-300 mb-4">
                You agree not to use the Service to:
              </Paragraph>
              <List className="text-gray-300">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service for any unlawful or fraudulent activity</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Remove, alter, or obscure any proprietary notices</li>
                <li>Resell, sublicense, or transfer your rights to use the Service</li>
              </List>
            </section>

            {/* Subscriptions */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">4. Subscriptions and Billing</H2>
              
              <H3 className="text-white mb-3">4.1 Subscription Plans</H3>
              <Paragraph className="text-gray-300 mb-4">
                Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set on a monthly or annual basis.
              </Paragraph>

              <H3 className="text-white mb-3">4.2 Payment Methods</H3>
              <Paragraph className="text-gray-300 mb-4">
                At the end of each Billing Cycle, your Subscription will automatically renew under the same conditions unless you cancel it or we cancel it. You may cancel your Subscription renewal through your online account management page or by contacting our customer support team.
              </Paragraph>

              <H3 className="text-white mb-3">4.3 Fee Changes</H3>
              <Paragraph className="text-gray-300 mb-4">
                IsoFlux, in its sole discretion and at any time, may modify the Subscription fees. Any Subscription fee change will become effective at the end of the then-current Billing Cycle. We will provide you with reasonable prior notice of any change in Subscription fees to give you an opportunity to terminate your Subscription before such change becomes effective.
              </Paragraph>

              <H3 className="text-white mb-3">4.4 Refunds</H3>
              <Paragraph className="text-gray-300">
                Except when required by law, paid Subscription fees are non-refundable. Refund requests will be considered on a case-by-case basis at our sole discretion.
              </Paragraph>
            </section>

            {/* Intellectual Property */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">5. Intellectual Property</H2>
              
              <H3 className="text-white mb-3">5.1 Our IP Rights</H3>
              <Paragraph className="text-gray-300 mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of IsoFlux and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
              </Paragraph>

              <H3 className="text-white mb-3">5.2 Your Data Rights</H3>
              <Paragraph className="text-gray-300 mb-4">
                You retain all rights to your transaction data and content that you submit to the Service ("Your Data"). By submitting Your Data, you grant IsoFlux a worldwide, non-exclusive license to use, process, and store Your Data solely for the purpose of providing the Service to you.
              </Paragraph>

              <H3 className="text-white mb-3">5.3 Feedback</H3>
              <Paragraph className="text-gray-300">
                If you provide feedback, ideas, or suggestions regarding the Service ("Feedback"), you agree that IsoFlux may use and incorporate such Feedback into the Service without any obligation to you, including without limitation, the obligation to compensate you.
              </Paragraph>
            </section>

            {/* Service Level Agreement */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">6. Service Level Agreement (SLA)</H2>
              
              <H3 className="text-white mb-3">6.1 Uptime Guarantee</H3>
              <Paragraph className="text-gray-300 mb-4">
                IsoFlux commits to a 99.99% uptime guarantee for Enterprise customers. If we fail to meet this commitment, you may be eligible for service credits as outlined in your Enterprise License Agreement.
              </Paragraph>

              <H3 className="text-white mb-3">6.2 Scheduled Maintenance</H3>
              <Paragraph className="text-gray-300 mb-4">
                We may perform scheduled maintenance which may result in temporary service interruptions. We will provide advance notice of scheduled maintenance when possible.
              </Paragraph>

              <H3 className="text-white mb-3">6.3 Performance Standards</H3>
              <Paragraph className="text-gray-300">
                IsoFlux strives to maintain the following performance standards:
              </Paragraph>
              <List className="text-gray-300">
                <li>Transaction processing time: &lt;150ms (average)</li>
                <li>API response time: &lt;100ms (95th percentile)</li>
                <li>Throughput: 1,000+ transactions per second</li>
                <li>Sanctions screening: Real-time (&lt;50ms)</li>
              </List>
            </section>

            {/* Data Security */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">7. Data Security and Compliance</H2>
              
              <H3 className="text-white mb-3">7.1 Security Standards</H3>
              <Paragraph className="text-gray-300 mb-4">
                IsoFlux implements industry-leading security measures including:
              </Paragraph>
              <List className="text-gray-300 mb-6">
                <li>SOC 2 Type II compliance</li>
                <li>Encryption at rest (AES-256) and in transit (TLS 1.3)</li>
                <li>Hardware Security Module (HSM) integration</li>
                <li>Mutual TLS (mTLS) for all API communications</li>
                <li>Row-level security (RLS) and role-based access control (RBAC)</li>
                <li>Comprehensive audit logging</li>
              </List>

              <H3 className="text-white mb-3">7.2 Regulatory Compliance</H3>
              <Paragraph className="text-gray-300">
                IsoFlux complies with applicable financial regulations including ISO 20022 standards, SWIFT requirements, SEC regulations, MiCA (EU), OFAC sanctions, and other jurisdictional requirements. You are responsible for ensuring your use of the Service complies with all applicable laws and regulations in your jurisdiction.
              </Paragraph>
            </section>

            {/* Termination */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">8. Termination</H2>
              
              <H3 className="text-white mb-3">8.1 Termination by You</H3>
              <Paragraph className="text-gray-300 mb-4">
                You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will immediately cease.
              </Paragraph>

              <H3 className="text-white mb-3">8.2 Termination by Us</H3>
              <Paragraph className="text-gray-300 mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive termination, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </Paragraph>

              <H3 className="text-white mb-3">8.3 Effect of Termination</H3>
              <Paragraph className="text-gray-300">
                Upon termination, we will retain your data for a period of 30 days for backup purposes, after which it will be permanently deleted unless retention is required by law or regulation. You may request an export of your data before termination.
              </Paragraph>
            </section>

            {/* Limitation of Liability */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">9. Limitation of Liability</H2>
              <Paragraph className="text-gray-300 mb-4">
                IN NO EVENT SHALL ISOFLUX, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </Paragraph>
              <List className="text-gray-300 mb-6">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use or alteration of your transmissions or content</li>
              </List>
              <Paragraph className="text-gray-300">
                WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
              </Paragraph>
              <Paragraph className="text-gray-300 mt-4">
                OUR MAXIMUM AGGREGATE LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
              </Paragraph>
            </section>

            {/* Disclaimer */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">10. Disclaimer</H2>
              <Paragraph className="text-gray-300">
                YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT OR COURSE OF PERFORMANCE.
              </Paragraph>
              <Paragraph className="text-gray-300 mt-4">
                ISOFLUX, ITS SUBSIDIARIES, AFFILIATES, AND ITS LICENSORS DO NOT WARRANT THAT:
              </Paragraph>
              <List className="text-gray-300">
                <li>The Service will function uninterrupted, secure or available at any particular time or location</li>
                <li>Any errors or defects will be corrected</li>
                <li>The Service is free of viruses or other harmful components</li>
                <li>The results of using the Service will meet your requirements</li>
              </List>
            </section>

            {/* Indemnification */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">11. Indemnification</H2>
              <Paragraph className="text-gray-300">
                You agree to defend, indemnify and hold harmless IsoFlux and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of:
              </Paragraph>
              <List className="text-gray-300">
                <li>Your use and access of the Service</li>
                <li>Your violation of any term of these Terms</li>
                <li>Your violation of any third party right, including without limitation any copyright, property, or privacy right</li>
                <li>Any claim that your data caused damage to a third party</li>
              </List>
            </section>

            {/* Governing Law */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">12. Governing Law</H2>
              <Paragraph className="text-gray-300">
                These Terms shall be governed and construed in accordance with the laws of [State/Country], without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </Paragraph>
              <Paragraph className="text-gray-300 mt-4">
                If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </Paragraph>
            </section>

            {/* Dispute Resolution */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">13. Dispute Resolution</H2>
              
              <H3 className="text-white mb-3">13.1 Informal Resolution</H3>
              <Paragraph className="text-gray-300 mb-4">
                In the event of any controversy or claim arising out of or relating to these Terms, the parties will consult and negotiate with each other and, recognizing their mutual interests, attempt to reach a solution satisfactory to both parties.
              </Paragraph>

              <H3 className="text-white mb-3">13.2 Binding Arbitration</H3>
              <Paragraph className="text-gray-300 mb-4">
                If the parties do not reach settlement within a period of 60 days, any unresolved controversy or claim will be settled by binding arbitration in accordance with the rules of the American Arbitration Association. The arbitrator's award will be final and may be entered as a judgment in any court of competent jurisdiction.
              </Paragraph>

              <H3 className="text-white mb-3">13.3 Class Action Waiver</H3>
              <Paragraph className="text-gray-300">
                You agree that any arbitration or proceeding shall be limited to the dispute between us and you individually. You agree to waive any right to have any dispute brought, heard, administered, resolved, or arbitrated as a class, collective, representative, or private attorney general action.
              </Paragraph>
            </section>

            {/* Changes */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">14. Changes to Terms</H2>
              <Paragraph className="text-gray-300">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </Paragraph>
              <Paragraph className="text-gray-300 mt-4">
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
              </Paragraph>
            </section>

            {/* Contact */}
            <section>
              <H2 className="text-[#4FC3F7] mb-4">15. Contact Us</H2>
              <Paragraph className="text-gray-300 mb-4">
                If you have any questions about these Terms, please contact us:
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

          {/* Other Legal Pages */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <Paragraph className="text-center text-gray-400 mb-4">
              Related Legal Documents
            </Paragraph>
            <div className="flex justify-center gap-6 flex-wrap">
              <Link href="/privacy" className="text-[#4FC3F7] hover:underline">
                Privacy Policy
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
