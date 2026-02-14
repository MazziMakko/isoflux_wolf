import Link from 'next/link';
import { 
  Zap, 
  Shield, 
  Database, 
  Cpu, 
  Rocket, 
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold gradient-text">FluxForge AI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-primary-600 transition">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-primary-600 transition">
                Pricing
              </Link>
              <Link href="#docs" className="text-gray-600 hover:text-primary-600 transition">
                Docs
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-primary-600 font-medium">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 section-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-6">
              <Star className="h-4 w-4" />
              <span className="text-sm font-semibold">Production-Ready in 24 Hours</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Build <span className="gradient-text">Enterprise SaaS</span>
              <br />
              with AI Orchestration
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The only platform combining RAG, Agentic AI, RBAC, and Multi-Tenant Architecture. 
              Launch profitable applications with zero blockchain dependencies.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/signup" className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2">
                <span>Start Building Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#demo" className="btn-secondary w-full sm:w-auto">
                Watch Demo
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-12 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale profitable SaaS applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                title: 'Agentic AI Orchestration',
                description: 'Multi-agent AI workflows with RAG, guardrails, and observability built-in.',
                color: 'text-blue-600',
              },
              {
                icon: Shield,
                title: 'Zero-Trust Security',
                description: 'Row-level security, RBAC, PII sanitization, and comprehensive audit logs.',
                color: 'text-green-600',
              },
              {
                icon: Database,
                title: 'Multi-Tenant Architecture',
                description: 'Scalable data isolation with Supabase, PostgreSQL, and RLS policies.',
                color: 'text-purple-600',
              },
              {
                icon: Zap,
                title: 'Webhook Orchestration',
                description: 'Stripe, Flutterwave, Mercury integrations with automatic retry logic.',
                color: 'text-yellow-600',
              },
              {
                icon: Rocket,
                title: 'Instant Deployment',
                description: 'One-click deploy to Vercel, Netlify, or your own infrastructure.',
                color: 'text-red-600',
              },
              {
                icon: TrendingUp,
                title: 'Built-in Analytics',
                description: 'Real-time dashboards, usage tracking, and revenue analytics.',
                color: 'text-indigo-600',
              },
            ].map((feature, index) => (
              <div key={index} className="glass-card p-8 hover:shadow-xl transition-all duration-300">
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 section-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Start free, scale as you grow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$49',
                features: [
                  '3 Projects',
                  '10K AI Requests/mo',
                  'Basic RAG',
                  'Email Support',
                  'Community Access',
                ],
              },
              {
                name: 'Pro',
                price: '$199',
                features: [
                  'Unlimited Projects',
                  '100K AI Requests/mo',
                  'Advanced RAG + Agents',
                  'Priority Support',
                  'Custom Integrations',
                  'White Label',
                ],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: '$499',
                features: [
                  'Everything in Pro',
                  'Unlimited AI Requests',
                  'Dedicated Infrastructure',
                  '24/7 Phone Support',
                  'SLA Guarantees',
                  'Custom Training',
                ],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`glass-card p-8 relative ${
                  plan.popular ? 'ring-2 ring-primary-600 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`w-full block text-center py-3 rounded-lg font-semibold transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Build Your Next Profitable SaaS?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers building production-ready applications with FluxForge AI
          </p>
          <Link href="/signup" className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition">
            <span>Start Building Free</span>
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-6 w-6 text-primary-500" />
                <span className="text-xl font-bold">FluxForge AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Build enterprise SaaS applications with AI-powered workflows.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="#docs">Documentation</Link></li>
                <li><Link href="#api">API Reference</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/security">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 FluxForge AI. All rights reserved. Built with Next.js, Supabase, and AI.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
