'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
  detectUserCurrency,
  formatCurrency,
  getQuickAmounts,
  toPayPalAmount,
  getConversionMessage,
  convertCurrency,
  CURRENCIES,
  EXCHANGE_RATES,
  Currency,
} from '@/lib/currency';
import { useToast } from '@/components/Toast';

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
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'yoco'>('paypal');

  // Detect user's currency on mount
  useEffect(() => {
    const currency = detectUserCurrency();
    setUserCurrency(currency);
  }, []);

  const quickAmounts = getQuickAmounts(userCurrency);
  const currencySymbol = CURRENCIES[userCurrency].symbol;

  const donationAmount = parseFloat(amount) || 0;
  
  // Fee calculations:
  // PayPal: 2.9% + $0.30 (converted to local currency) + 1% Mishteh
  // Yoco: 2.6% + 1% Mishteh = 3.6%
  
  const calculateFees = (amount: number, method: 'paypal' | 'yoco') => {
    if (amount <= 0) return { processingFee: 0, mishtehFee: 0, totalFee: 0, total: 0 };
    
    const mishtehFeePercent = 0.01; // 1% for Mishteh
    const mishtehFee = amount * mishtehFeePercent;
    
    let processingFee = 0;
    
    if (method === 'yoco') {
      // Yoco: 2.6% of (amount + mishteh fee)
      processingFee = (amount + mishtehFee) * 0.026;
    } else {
      // PayPal: 2.9% + $0.30 (converted to local currency)
      const fixedFee = userCurrency === 'USD' ? 0.30 : convertCurrency(0.30, 'USD', userCurrency);
      processingFee = (amount + mishtehFee) * 0.029 + fixedFee;
    }
    
    const totalFee = mishtehFee + processingFee;
    const total = amount + totalFee;
    
    return { processingFee, mishtehFee, totalFee, total };
  };
  
  const fees = calculateFees(donationAmount, paymentMethod);
  const totalAmount = fees.total;
  const recipientReceives = donationAmount; // Recipient gets the full donation amount
  
  // Convert total to USD for PayPal using the proper conversion function
  const usdAmount = toPayPalAmount(totalAmount, userCurrency);

  const handleAmountConfirm = () => {
    if (donationAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    
    // If Yoco is selected, process Yoco payment
    if (paymentMethod === 'yoco') {
      handleYocoPayment();
      return;
    }
    
    // Otherwise show PayPal buttons
    setShowPayPal(true);
  };

  const handleYocoPayment = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      // Create Yoco checkout session with total amount (including fees)
      const response = await fetch('/api/yoco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: donationAmount, // Original donation amount (what recipient gets)
          totalAmount: totalAmount, // Total with fees (what user pays)
          requestId,
          isAnonymous: anonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Yoco checkout');
      }

      // Open Yoco checkout in new tab (as per Yoco requirements)
      window.open(data.checkoutUrl, '_blank');
      
      // Show success message to user
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
          amount: usdAmount, // Always send USD to PayPal (they support USD everywhere)
          currency: 'USD',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      console.log('PayPal order created:', data.id);
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
          totalAmount: totalAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Capture error:', result);
        throw new Error(result.error || 'Failed to capture payment');
      }

      console.log('Payment captured successfully:', result);
      // Success - redirect to dashboard with success message
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
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Make a Donation</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">{requestTitle}</h3>
          {targetAmount && (
            <div className="text-sm text-gray-600">
              <p>Goal: {formatCurrency(targetAmount, userCurrency)}</p>
              <p>Raised: {formatCurrency(currentAmount, userCurrency)}</p>
              <p>Remaining: {formatCurrency(targetAmount - currentAmount, userCurrency)}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Payment Method Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('paypal');
                  setShowPayPal(false);
                }}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">💳</span>
                  <span>PayPal</span>
                  <span className="text-xs text-gray-500">Global</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('yoco');
                  setShowPayPal(false);
                }}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                  paymentMethod === 'yoco'
                    ? 'border-green-600 bg-green-50 text-green-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">🇿🇦</span>
                  <span>Yoco</span>
                  <span className="text-xs text-gray-500">SA + Apple Pay</span>
                </div>
              </button>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={userCurrency}
              onChange={(e) => {
                setUserCurrency(e.target.value as Currency);
                setAmount('');
                setShowPayPal(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              {Object.entries(CURRENCIES).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.symbol} {config.name}
                </option>
              ))}
            </select>
          </div>

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
                  className={`px-2 py-2 border rounded-md text-xs font-medium transition-colors whitespace-nowrap overflow-hidden ${
                    amount === quickAmount.toString()
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={`${currencySymbol}${quickAmount}`}
                >
                  {currencySymbol}{quickAmount}
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
              <span className="ml-2 text-sm text-gray-700">
                Keep my donation private
              </span>
            </label>
            <p className="mt-2 text-xs text-gray-500">
              Donor names are hidden by default unless you choose to show them in your dashboard privacy settings and uncheck this box for this donation.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* PayPal Buttons or Confirm Button */}
          {showPayPal && donationAmount > 0 && paymentMethod === 'paypal' ? (
            <div className="mb-4">
              {/* Fee Breakdown */}
              <div className="mb-3 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-semibold text-green-900 mb-2">💚 Payment Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-800">Donation to recipient:</span>
                    <span className="font-semibold text-green-900">{formatCurrency(donationAmount, userCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-700">
                    <span>PayPal fee (~2.9% + $0.30):</span>
                    <span>+{formatCurrency(fees.processingFee, userCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-700">
                    <span>Mishteh platform fee (1%):</span>
                    <span>+{formatCurrency(fees.mishtehFee, userCurrency)}</span>
                  </div>
                  <div className="text-xs text-green-600 italic">
                    100% of your donation goes to the recipient
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-300">
                    <span className="font-semibold text-green-900">Total you'll pay:</span>
                    <span className="font-bold text-green-900">{formatCurrency(totalAmount, userCurrency)}</span>
                  </div>
                </div>
              </div>
              
              {userCurrency !== 'USD' && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    💱 PayPal will charge: <strong>{formatCurrency(usdAmount, 'USD')}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Converted from {formatCurrency(totalAmount, userCurrency)}
                  </p>
                </div>
              )}
              
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <>
              {/* Show fee breakdown before submitting for Yoco */}
              {donationAmount > 0 && paymentMethod === 'yoco' && (
                <div className="mb-3 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h4 className="font-semibold text-green-900 mb-2">💚 Payment Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-800">Donation to recipient:</span>
                      <span className="font-semibold text-green-900">{formatCurrency(donationAmount, userCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-700">
                      <span>Yoco fee (2.6%):</span>
                      <span>+{formatCurrency(fees.processingFee, userCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-700">
                      <span>Mishteh platform fee (1%):</span>
                      <span>+{formatCurrency(fees.mishtehFee, userCurrency)}</span>
                    </div>
                    <div className="text-xs text-green-600 italic">
                      100% of your donation goes to the recipient
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-300">
                      <span className="font-semibold text-green-900">Total you'll pay:</span>
                      <span className="font-bold text-green-900">{formatCurrency(totalAmount, userCurrency)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting 
                  ? 'Processing...' 
                  : paymentMethod === 'yoco'
                    ? `Pay with Yoco - ${formatCurrency(totalAmount, userCurrency)}`
                    : `Continue to PayPal - ${formatCurrency(totalAmount, userCurrency)}`
                }
              </button>
            </>
          )}
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Your donation helps those in need. Secure payment powered by {paymentMethod === 'yoco' ? 'Yoco (with Apple Pay support)' : 'PayPal'}.
        </p>
      </div>
    </PayPalScriptProvider>
  );
}
