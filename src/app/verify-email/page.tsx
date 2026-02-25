'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const email = searchParams.get('email');

  useEffect(() => {
    // Check if there's a token in the URL (from email link click)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // User clicked email verification link
      handleEmailVerification(hash);
    }
  }, []);

  const handleEmailVerification = async (hash: string) => {
    try {
      // Parse the hash to get the tokens
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken) {
        throw new Error('Invalid verification link');
      }

      // Call our API to complete verification
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Store tokens
      localStorage.setItem('wolf_shield_token', data.token);
      localStorage.setItem('wolf_shield_user', JSON.stringify(data.user));
      localStorage.setItem('wolf_shield_org', JSON.stringify(data.organization));

      setStatus('success');
      setMessage('Email verified! Redirecting to your dashboard...');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Verification failed. Please try again or contact support.');
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;

    setStatus('pending');
    setMessage('Sending verification email...');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend email');
      }

      setStatus('success');
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to resend email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <span className="text-4xl">🐺</span>
            <span className="text-3xl font-bold text-emerald-400">Wolf Shield</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-slate-300">
            We sent a verification link to{' '}
            <strong className="text-emerald-400">{email || 'your email'}</strong>
          </p>
        </div>

        <div className="glass-card p-8 border border-slate-700 bg-slate-800/50 backdrop-blur">
          <div className="text-center">
            {status === 'pending' && (
              <>
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
                    <Mail className="w-10 h-10 text-emerald-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-4">Check Your Inbox</h2>
                <p className="text-slate-300 mb-6">
                  Click the verification link in the email we sent you to activate your account and
                  access your dashboard.
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Didn't receive the email?</p>
                  <button
                    onClick={handleResendEmail}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm underline"
                  >
                    Resend verification email
                  </button>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center border-2 border-emerald-500">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-emerald-400 mb-4">Email Verified!</h2>
                <p className="text-slate-300 mb-6">{message}</p>
                <div className="flex items-center justify-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Redirecting to dashboard...</span>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center border-2 border-red-500">
                    <XCircle className="w-10 h-10 text-red-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-red-400 mb-4">Verification Failed</h2>
                <p className="text-slate-300 mb-6">{message}</p>
                <div className="space-y-3">
                  <button
                    onClick={handleResendEmail}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Resend Verification Email
                  </button>
                  <p className="text-sm text-slate-400">
                    Need help?{' '}
                    <a
                      href="mailto:support@isoflux.app"
                      className="text-emerald-400 hover:underline"
                    >
                      Contact support
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link href="/login" className="underline hover:text-emerald-400">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
