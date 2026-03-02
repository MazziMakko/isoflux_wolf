'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setValidToken(true);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken && error) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center h-16 w-16 bg-red-100 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <a href="/forgot-password" className="btn-primary inline-block">
          Request New Reset Link
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center h-16 w-16 bg-[#50C878]/10 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-[#50C878]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful!</h3>
        <p className="text-gray-600 mb-4">
          Your password has been updated successfully.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="input-field pl-10"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="input-field pl-10"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !validToken}
        className="btn-primary w-full"
      >
        {loading ? 'Updating Password...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <ResetPasswordFormContent />
  );
}
