'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Mail, Lock } from 'lucide-react';
import { getSupabaseBrowser, setSupabaseSession } from '@/lib/supabase-browser';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // FAILSAFE: If redirected from middleware with autoretry=1, attempt to restore session
  useEffect(() => {
    const autoRetry = searchParams.get('autoretry');
    const profileMissing = searchParams.get('profile_missing');
    const wolfToken = localStorage.getItem('wolf_shield_token');
    const wolfRefreshToken = localStorage.getItem('wolf_shield_refresh_token');

    if (autoRetry === '1' && wolfToken) {
      // Attempt to restore Supabase session
      setSupabaseSession(wolfToken, wolfRefreshToken ?? undefined)
        .then(() => {
          const redirect = searchParams.get('redirect') || '/dashboard';
          router.push(redirect);
        })
        .catch(() => {
          setError('Session expired. Please log in again.');
        });
    }

    if (profileMissing === '1') {
      setError('Your account profile is incomplete. Please log in again to restore it.');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (data.code === 'NO_PROFILE' ? 'Account not set up. Please sign up first.' : 'Login failed'));
      }

      // Persist for dashboard and API (Bearer token fallback)
      localStorage.setItem('wolf_shield_token', data.token);
      localStorage.setItem('wolf_shield_user', JSON.stringify(data.user));
      localStorage.setItem('wolf_shield_org', JSON.stringify(data.organization));
      
      // Store refresh token for session restoration
      if (data.refresh_token) {
        localStorage.setItem('wolf_shield_refresh_token', data.refresh_token);
      }

      // Set Supabase session in cookies so server getSession() works
      // CRITICAL: Do NOT timeout here; session must be set for middleware
      if (data.token) {
        try {
          await setSupabaseSession(data.token, data.refresh_token);
        } catch (sessionError) {
          console.error('[Login] Supabase session set failed:', sessionError);
          // Non-fatal; API routes will use Bearer token from cookie
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen section-gradient flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <span className="text-4xl">🐺</span>
            <span className="text-3xl font-bold text-emerald-400">Wolf Shield</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to manage your properties</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <strong>Login failed.</strong> {error}
                <p className="text-sm mt-1">
                  Need help? Text/Call: <a href="tel:+18562748668" className="underline text-red-700">(856) 274-8668</a>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="text-right mt-2">
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen section-gradient flex items-center justify-center px-4">
        <div className="text-xl text-emerald-400 animate-pulse">⚡ Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
