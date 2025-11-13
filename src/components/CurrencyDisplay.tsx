'use client';

import { useEffect, useState } from 'react';
import { detectUserCurrency, formatCurrency, Currency } from '@/lib/currency';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export function CurrencyDisplay({ amount, className = '' }: CurrencyDisplayProps) {
  const [userCurrency, setUserCurrency] = useState<Currency>('ZAR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUserCurrency(detectUserCurrency());
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show USD on server-side render to avoid hydration mismatch
    return <span className={className}>${amount.toFixed(2)}</span>;
  }

  return <span className={className}>{formatCurrency(amount, userCurrency)}</span>;
}

interface ProgressBarProps {
  currentAmount: number;
  targetAmount: number;
}

export function CurrencyProgressBar({ currentAmount, targetAmount }: ProgressBarProps) {
  const [userCurrency, setUserCurrency] = useState<Currency>('ZAR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUserCurrency(detectUserCurrency());
    setMounted(true);
  }, []);

  const progressPercentage = targetAmount
    ? Math.min((currentAmount / targetAmount) * 100, 100)
    : 0;

  if (!mounted) {
    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">
            ${currentAmount.toFixed(2)}
          </span>
          <span className="text-gray-500">
            of ${targetAmount.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {progressPercentage.toFixed(1)}% funded
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-gray-700">
          {formatCurrency(currentAmount, userCurrency)}
        </span>
        <span className="text-gray-500">
          of {formatCurrency(targetAmount, userCurrency)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-primary-600 h-3 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {progressPercentage.toFixed(1)}% funded
      </p>
    </div>
  );
}
