import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Set New Password | IsoFlux Wolf Shield',
  description: 'Set your new Wolf Shield password',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen section-gradient flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center space-x-2 mb-6 text-gray-400 hover:text-[#50C878] transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to login</span>
          </Link>
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-[#50C878]/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-[#50C878]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
          <Suspense fallback={
            <div className="text-center py-8">
              <div className="text-xl text-gray-400 animate-pulse">Loading...</div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
