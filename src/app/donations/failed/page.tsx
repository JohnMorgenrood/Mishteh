'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Loader2 } from 'lucide-react';

function DonationFailedContent() {
  const searchParams = useSearchParams();
  const donationId = searchParams.get('donationId');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-2">
          Unfortunately, your payment could not be processed.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This could be due to insufficient funds, card issues, or a declined transaction.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 font-medium">
            ❌ Transaction unsuccessful
          </p>
          <p className="text-xs text-red-600 mt-1">
            No charges were made to your account.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/requests"
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-md border-2 border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Need help? <Link href="/contact" className="text-primary-600 hover:underline">Contact support</Link>
        </p>
      </div>
    </div>
  );
}

export default function DonationFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        </div>
      </div>
    }>
      <DonationFailedContent />
    </Suspense>
  );
}
