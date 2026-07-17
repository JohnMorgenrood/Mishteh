import { Currency, convertCurrency } from '@/lib/currency';

export const MISHTEH_PLATFORM_FEE_RATE = 0.02;
export const YOCO_FEE_RATE = 0.0339;
export const YOCO_TOTAL_FEE_RATE = MISHTEH_PLATFORM_FEE_RATE + YOCO_FEE_RATE;
export const PAYPAL_PERCENT_FEE_RATE = 0.029;
export const PAYPAL_FIXED_FEE_USD = 0.3;

export interface FeeBreakdown {
  grossAmount: number;
  processingFee: number;
  platformFee: number;
  totalFees: number;
  netAmount: number;
}

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

// Yoco fees are added on top so the requested donation remains the recipient payout.
export function calculateYocoBreakdown(netDonationAmount: number): FeeBreakdown {
  const grossAmount = roundCurrency(netDonationAmount / (1 - YOCO_TOTAL_FEE_RATE));
  return calculateYocoBreakdownFromGross(grossAmount, roundCurrency(netDonationAmount));
}

// Reconcile a checkout amount already charged by Yoco.
export function calculateYocoBreakdownFromGross(grossAmount: number, expectedNetAmount?: number): FeeBreakdown {
  const processingFee = roundCurrency(grossAmount * YOCO_FEE_RATE);
  const platformFee = expectedNetAmount === undefined
    ? roundCurrency(grossAmount * MISHTEH_PLATFORM_FEE_RATE)
    : roundCurrency(Math.max(grossAmount - processingFee - expectedNetAmount, 0));
  const totalFees = roundCurrency(processingFee + platformFee);
  const netAmount = expectedNetAmount === undefined
    ? roundCurrency(Math.max(grossAmount - totalFees, 0))
    : roundCurrency(expectedNetAmount);

  return {
    grossAmount: roundCurrency(grossAmount),
    processingFee,
    platformFee,
    totalFees,
    netAmount,
  };
}

export function calculatePayPalBreakdown(
  grossAmount: number,
  currency: Currency
): FeeBreakdown {
  const fixedFee = currency === 'USD'
    ? PAYPAL_FIXED_FEE_USD
    : convertCurrency(PAYPAL_FIXED_FEE_USD, 'USD', currency);
  const processingFee = roundCurrency((grossAmount * PAYPAL_PERCENT_FEE_RATE) + fixedFee);
  const platformFee = roundCurrency(grossAmount * MISHTEH_PLATFORM_FEE_RATE);
  const totalFees = roundCurrency(processingFee + platformFee);
  const netAmount = roundCurrency(Math.max(grossAmount - totalFees, 0));

  return {
    grossAmount: roundCurrency(grossAmount),
    processingFee,
    platformFee,
    totalFees,
    netAmount,
  };
}
