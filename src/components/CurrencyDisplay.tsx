'use client';

import { formatCurrency, Currency } from '@/lib/currency';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  currency?: Currency;
}

export function CurrencyDisplay({ amount, className = '', currency = 'ZAR' }: CurrencyDisplayProps) {
  return <span className={className}>{formatCurrency(amount, currency)}</span>;
}

interface ProgressBarProps {
  currentAmount: number;
  targetAmount: number;
  currency?: Currency;
}

export function CurrencyProgressBar({ currentAmount, targetAmount, currency = 'ZAR' }: ProgressBarProps) {
  const progressPercentage = targetAmount
    ? Math.min((currentAmount / targetAmount) * 100, 100)
    : 0;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-gray-700">
          {formatCurrency(currentAmount, currency)}
        </span>
        <span className="text-gray-500">
          of {formatCurrency(targetAmount, currency)}
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
