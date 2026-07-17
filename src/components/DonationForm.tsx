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
      <div className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-[0_24px_65px_-32px_rgba(37,72,113,0.45)]">
        <div className="border-b border-primary-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-5 py-6 sm:px-7">
          <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.18em] text-primary-700">Secure giving</p>
          <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Make a Donation</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-700">Choose an amount and send meaningful support directly to this request.</p>
        </div>

        <div className="mx-5 mt-5 rounded-2xl border border-secondary-100 bg-secondary-50/70 p-4 sm:mx-7 sm:p-5">
          <h3 className="mb-3 text-lg font-bold text-secondary-900">{requestTitle}</h3>
          {targetAmount && (
            <div className="grid gap-2 text-sm text-slate-800 sm:grid-cols-3">
              <p><span className="block text-xs font-bold uppercase tracking-wide text-slate-600">Goal</span><strong className="text-secondary-900">{formatCurrency(targetAmount, userCurrency)}</strong></p>
              <p><span className="block text-xs font-bold uppercase tracking-wide text-slate-600">Raised</span><strong className="text-green-700">{formatCurrency(currentAmount, userCurrency)}</strong></p>
              <p><span className="block text-xs font-bold uppercase tracking-wide text-slate-600">Remaining</span><strong className="text-secondary-900">{formatCurrency(Math.max(targetAmount - currentAmount, 0), userCurrency)}</strong></p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-7">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-slate-900">
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
                className={`rounded-2xl border-2 px-3 py-4 font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/40'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">PayPal</span>
                  <span className="text-xs font-medium text-slate-600">Global</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('yoco');
                  setShowPayPal(false);
                  setError('');
                }}
                className={`rounded-2xl border-2 px-3 py-4 font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-green-100 ${
                  paymentMethod === 'yoco'
                    ? 'border-green-600 bg-green-50 text-green-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-green-300 hover:bg-green-50/40'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">Yoco</span>
                  <span className="text-xs font-medium text-slate-600">SA + Apple Pay</span>
                </div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-slate-900">
              Currency
            </label>
            <select
              value={userCurrency}
              onChange={(e) => {
                setUserCurrency(e.target.value as Currency);
                setAmount('');
                setShowPayPal(false);
              }}
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 font-medium text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
            >
              {Object.entries(CURRENCIES).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.symbol} {config.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-slate-900">
              Quick Select Amount
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => {
                    setAmount(quickAmount.toString());
                    setShowPayPal(false);
                  }}
                  className={`min-h-11 overflow-hidden whitespace-nowrap rounded-xl border px-2 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-primary-100 ${
                    amount === quickAmount.toString()
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-slate-300 bg-white text-slate-800 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                  title={`${currencySymbol}${quickAmount}`}
                >
                  {currencySymbol}{quickAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="amount" className="mb-2 block text-sm font-bold text-slate-900">
              {paymentMethod === 'yoco' ? 'Donation Amount' : 'Total Amount You Want To Pay'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-secondary-800">{currencySymbol}</span>
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
                className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-lg font-bold text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                placeholder="0.00"
                required
              />
            </div>
            <p className="mt-2 text-xs font-medium leading-5 text-slate-700">
              {paymentMethod === 'yoco'
                ? 'Processing and service costs are added to this donation. You will see the complete total before continuing.'
                : 'Processing and platform fees are included in this amount before the requester payout is calculated.'}
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="mb-2 block text-sm font-bold text-slate-900">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              placeholder="Leave a message of encouragement..."
            />
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-5 w-5 rounded border-slate-400 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3 text-sm font-bold text-slate-900">
                Keep my donation private
              </span>
            </label>
            <p className="ml-8 mt-2 text-xs font-medium leading-5 text-slate-700">
              Donor names are hidden by default unless you choose to show them in your dashboard privacy settings and uncheck this box for this donation.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
              {error.toLowerCase().includes('membership') && <a href="/membership" className="mt-2 inline-block text-sm font-bold text-red-900 underline">Renew for R10 to continue</a>}
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
                {paymentMethod === 'yoco' ? (
                  <div className="flex justify-between text-xs text-green-700">
                    <span>Processing and service costs:</span>
                    <span>-{formatCurrency(fees.totalFees, userCurrency)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-xs text-green-700"><span>PayPal processing fee:</span><span>-{formatCurrency(fees.processingFee, userCurrency)}</span></div>
                    <div className="flex justify-between text-xs text-green-700"><span>Platform service fee:</span><span>-{formatCurrency(fees.platformFee, userCurrency)}</span></div>
                  </>
                )}
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
          <p className="mt-4 text-center text-xs font-medium text-slate-700">
          Your donation helps those in need. Secure payment powered by {paymentMethod === 'yoco' ? 'Yoco' : 'PayPal'}.
          </p>
        </form>
      </div>
    </PayPalScriptProvider>
  );
}
