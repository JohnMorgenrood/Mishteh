'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
  detectUserCurrency,
  formatCurrency,
  getQuickAmounts,
  toPayPalAmount,
  CURRENCIES,
  Currency,
} from '@/lib/currency';
import { calculatePayPalBreakdown, calculateYocoBreakdown } from '@/lib/payment-fees';
import { useToast } from '@/components/Toast';
import { ShieldCheck } from 'lucide-react';

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
  const toast = useToast();
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPayPal, setShowPayPal] = useState(false);
  const [userCurrency, setUserCurrency] = useState<Currency>('ZAR');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'yoco'>('yoco');

  useEffect(() => {
    const currency = detectUserCurrency();
    setUserCurrency(currency);
    setPaymentMethod(currency === 'ZAR' ? 'yoco' : 'paypal');
  }, []);

  const quickAmounts = getQuickAmounts(userCurrency);
  const currencySymbol = CURRENCIES[userCurrency].symbol;
  const donationAmount = parseFloat(amount) || 0;

  const fees = paymentMethod === 'yoco'
    ? calculateYocoBreakdown(donationAmount)
    : calculatePayPalBreakdown(donationAmount, userCurrency);

  const totalAmount = fees.grossAmount;
  const recipientReceives = fees.netAmount;
  const usdAmount = toPayPalAmount(totalAmount, userCurrency);
  const paypalMinimumUsd = 5;
  const paypalBelowMinimum = paymentMethod === 'paypal' && usdAmount < paypalMinimumUsd;

  const handleAmountConfirm = () => {
    if (donationAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (recipientReceives <= 0) {
      setError('This amount is too small after fees. Please increase it a little.');
      return;
    }

    if (paypalBelowMinimum) {
      setError(`PayPal is only available for totals of at least ${formatCurrency(paypalMinimumUsd, 'USD')}. Please use Yoco for smaller donations.`);
      return;
    }

    setError('');

    if (paymentMethod === 'yoco') {
      handleYocoPayment();
      return;
    }

    setShowPayPal(true);
  };

  const handleYocoPayment = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/yoco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: donationAmount,
          totalAmount,
          requestId,
          isAnonymous: anonymous,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Yoco checkout');
      }

      window.open(data.checkoutUrl, '_blank');
      toast.info('Yoco payment window opened in a new tab. Please complete your payment there.', 8000);
    } catch (err: any) {
      console.error('Yoco payment error:', err);
      setError(err.message || 'Failed to process Yoco payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createOrder = async () => {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: usdAmount,
          currency: 'USD',
          requestId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data.id;
    } catch (err: any) {
      console.error('Create order error:', err);
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
          originalCurrency: userCurrency,
          originalAmount: donationAmount,
          totalAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture payment');
      }

      toast.success('Thank you for your donation! Your payment has been processed successfully.', 6000);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Payment error:', err);
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
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Make a Donation</h2>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-900">{requestTitle}</h3>
          {targetAmount && (
            <div className="text-sm text-gray-600">
              <p>Goal: {formatCurrency(targetAmount, userCurrency)}</p>
              <p>Raised: {formatCurrency(currentAmount, userCurrency)}</p>
              <p>Remaining: {formatCurrency(targetAmount - currentAmount, userCurrency)}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('paypal');
                  setShowPayPal(false);
                  setError('');
                }}
                className={`rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">PayPal</span>
                  <span className="text-xs text-gray-500">Global</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('yoco');
                  setShowPayPal(false);
                  setError('');
                }}
                className={`rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  paymentMethod === 'yoco'
                    ? 'border-green-600 bg-green-50 text-green-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">Yoco</span>
                  <span className="text-xs text-gray-500">SA + Apple Pay</span>
                </div>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              value={userCurrency}
              onChange={(e) => {
                setUserCurrency(e.target.value as Currency);
                setAmount('');
                setShowPayPal(false);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
            >
              {Object.entries(CURRENCIES).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.symbol} {config.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
                  className={`overflow-hidden whitespace-nowrap rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                    amount === quickAmount.toString()
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  title={`${currencySymbol}${quickAmount}`}
                >
                  {currencySymbol}{quickAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="amount" className="mb-2 block text-sm font-medium text-gray-700">
              Total Amount You Want To Pay
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">{currencySymbol}</span>
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
                className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-4 focus:border-primary-500 focus:ring-primary-500"
                placeholder="0.00"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Processing and platform fees are deducted from this amount before the requester payout is calculated.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
              placeholder="Leave a message of encouragement..."
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Keep my donation private
              </span>
            </label>
            <p className="mt-2 text-xs text-gray-500">
              Donor names are hidden by default unless you choose to show them in your dashboard privacy settings and uncheck this box for this donation.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {donationAmount > 0 && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4">
              <h4 className="mb-2 font-semibold text-green-900">Payment Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-800">You pay:</span>
                  <span className="font-semibold text-green-900">{formatCurrency(totalAmount, userCurrency)}</span>
                </div>
                <div className="flex justify-between text-xs text-green-700">
                  <span>{paymentMethod === 'yoco' ? 'Yoco fee (2.6%):' : 'PayPal fee (~2.9% + $0.30):'}</span>
                  <span>-{formatCurrency(fees.processingFee, userCurrency)}</span>
                </div>
                <div className="flex justify-between text-xs text-green-700">
                  <span>Mishteh platform fee (1%):</span>
                  <span>-{formatCurrency(fees.platformFee, userCurrency)}</span>
                </div>
                <div className="pt-2 text-xs italic text-green-600">
                  {paymentMethod === 'yoco'
                    ? 'Yoco is recommended for South African Rand donations because the local fee structure is better for smaller payments.'
                    : 'PayPal works best for larger international donations because fixed fees apply.'}
                </div>
                <div className="flex justify-between border-t border-green-300 pt-2">
                  <span className="font-semibold text-green-900">Requester receives:</span>
                  <span className="font-bold text-green-900">{formatCurrency(recipientReceives, userCurrency)}</span>
                </div>
              </div>
            </div>
          )}

          {showPayPal && donationAmount > 0 && paymentMethod === 'paypal' ? (
            <div className="mb-4">
              {userCurrency !== 'USD' && (
                <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm text-blue-800">
                    PayPal will charge: <strong>{formatCurrency(usdAmount, 'USD')}</strong>
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    Converted from {formatCurrency(totalAmount, userCurrency)}
                  </p>
                </div>
              )}

              {paypalBelowMinimum && (
                <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-800">
                    PayPal is not recommended for small donations in Rand.
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    Use Yoco for smaller South African payments, or increase this donation to at least {formatCurrency(paypalMinimumUsd, 'USD')}.
                  </p>
                </div>
              )}

              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                disabled={isSubmitting || paypalBelowMinimum}
              />
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="w-full rounded-xl bg-[#d6652f] px-6 py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#b34e27] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
            >
              {isSubmitting
                ? 'Processing...'
                : paymentMethod === 'yoco'
                  ? `Continue with Yoco - ${formatCurrency(totalAmount, userCurrency)}`
                  : `Continue to PayPal - ${formatCurrency(totalAmount, userCurrency)}`}
            </button>
          )}
          {paymentMethod === 'yoco' && (
            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/60 p-3.5">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
                <ShieldCheck className="h-4 w-4 text-[#d6652f]" />
                Secure checkout powered by Yoco
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Payment methods available through Yoco checkout">
                {['VISA', 'Mastercard', 'AMEX', 'Instant EFT', 'Apple Pay', 'Google Pay'].map((method) => (
                  <span key={method} className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-extrabold tracking-tight text-gray-700 shadow-sm">
                    {method}
                  </span>
                ))}
              </div>
              <p className="mt-2.5 text-center text-[10px] leading-4 text-gray-500">Available options are confirmed on the secure Yoco checkout screen.</p>
            </div>
          )}
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Your donation helps those in need. Secure payment powered by {paymentMethod === 'yoco' ? 'Yoco' : 'PayPal'}.
        </p>
      </div>
    </PayPalScriptProvider>
  );
}
