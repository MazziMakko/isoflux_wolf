import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | IsoFlux Wolf Shield',
  description: 'Reset your Wolf Shield password',
};

export default function ForgotPasswordPage() {
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
              <Mail className="h-8 w-8 text-[#50C878]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
          <ForgotPasswordForm />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="tel:856-274-8668" className="text-[#50C878] font-semibold hover:underline">
              Call (856) 274-8668
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
