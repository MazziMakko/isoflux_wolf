/**
 * =====================================================
 * GLOBAL FOOTER WITH LEGAL LINKS
 * Wolf Shield HUD-Secure Pro
 * =====================================================
 */

import Link from 'next/link';

export function GlobalFooter() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="mb-4 text-xl font-bold text-emerald-400">🐺 Wolf Shield</h3>
            <p className="text-sm text-slate-400">
              HUD-Secure Pro by New Jerusalem Holdings, LLC
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Wyoming, USA
            </p>
            <p className="mt-4 text-xs text-slate-500">© 2026 All rights reserved.</p>
          </div>

          {/* Product */}
          <div className="col-span-1">
            <h4 className="mb-4 text-sm font-semibold uppercase text-slate-300">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/pricing" className="hover:text-emerald-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-emerald-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-emerald-400">
                  Start Free Trial
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400">
                  Contact Sales
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h4 className="mb-4 text-sm font-semibold uppercase text-slate-300">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="mailto:support@isoflux.app" className="hover:text-emerald-400">
                  support@isoflux.app
                </a>
              </li>
              <li>
                <a href="tel:+18562748668" className="hover:text-emerald-400">
                  (856) 274-8668
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="mb-4 text-sm font-semibold uppercase text-slate-300">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/msa" className="hover:text-emerald-400">
                  Master Subscription Agreement
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-emerald-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/tenant-eula" className="hover:text-emerald-400">
                  Tenant EULA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
            <p>
              Wolf Shield™ is a trademark of New Jerusalem Holdings, LLC. All intellectual property rights
              reserved.
            </p>
            <p>
              <a href="mailto:support@isoflux.app" className="hover:text-emerald-400">
                support@isoflux.app
              </a>
            </p>
          </div>
          <div className="mt-4 text-center text-xs text-slate-600">
            <p>
              Wolf Shield is a software utility. We are not a legal advisor, HUD agent, or compliance officer.
              Compliance is your responsibility.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
