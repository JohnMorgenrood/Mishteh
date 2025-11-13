'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface DonationFormProps {
  requestId: string;
  requestTitle: string;
  targetAmount?: number | null;
  currentAmount: number;
}

export default function DonationForm({
  requestId,
  requestTitle,
  targetAmount,
  currentAmount,
}: DonationFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPayPal, setShowPayPal] = useState(false);

  const quickAmounts = [10, 25, 50, 100, 250];

  const donationAmount = parseFloat(amount) || 0;

  const handleAmountConfirm = () => {
    if (donationAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    setShowPayPal(true);
  };

  const createOrder = async () => {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: donationAmount,
          currency: 'USD',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data.id;
    } catch (err: any) {
      setError(err.message || 'Failed to create PayPal order');
      throw err;
    }
  };

  const onApprove = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
          requestId,
          message,
          anonymous,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture payment');
      }

      // Success - redirect to dashboard with success message
      alert('Thank you for your donation! Your payment has been processed successfully.');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to process donation');
      setIsSubmitting(false);
    }
  };

  const onError = (err: any) => {
    console.error('PayPal error:', err);
    setError('An error occurred with PayPal. Please try again.');
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleAmountConfirm();
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: 'USD',
      }}
    >
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Make a Donation</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">{requestTitle}</h3>
          {targetAmount && (
            <div className="text-sm text-gray-600">
              <p>Goal: ${targetAmount.toFixed(2)}</p>
              <p>Raised: ${currentAmount.toFixed(2)}</p>
              <p>Remaining: ${(targetAmount - currentAmount).toFixed(2)}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick Amount Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select Amount
            </label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => {
                    setAmount(quickAmount.toString());
                    setShowPayPal(false);
                  }}
                  className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    amount === quickAmount.toString()
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setShowPayPal(false);
                }}
                step="0.01"
                min="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Leave a message of encouragement..."
            />
          </div>

          {/* Anonymous Checkbox */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Make this donation anonymous</span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* PayPal Buttons or Confirm Button */}
          {showPayPal && donationAmount > 0 ? (
            <div className="mb-4">
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Processing...' : `Continue to PayPal - $${donationAmount.toFixed(2)}`}
            </button>
          )}
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Your donation helps those in need. Secure payment powered by PayPal.
        </p>
      </div>
    </PayPalScriptProvider>
  );
}
