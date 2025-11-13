// Currency conversion and localization utilities

export type Currency = 'USD' | 'ZAR' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  locale: string;
  name: string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    name: 'US Dollar',
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    locale: 'en-ZA',
    name: 'South African Rand',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'en-EU',
    name: 'Euro',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    name: 'British Pound',
  },
};

// Exchange rates (update these regularly or use an API)
// Base currency is USD
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  ZAR: 18.50, // 1 USD = 18.50 ZAR (approximate)
  EUR: 0.92,  // 1 USD = 0.92 EUR
  GBP: 0.79,  // 1 USD = 0.79 GBP
};

/**
 * Detect user's currency based on location/locale
 */
export function detectUserCurrency(): Currency {
  // Server-side: would use IP geolocation
  // Client-side: use browser locale
  if (typeof window === 'undefined') {
    return 'ZAR'; // Default to ZAR for South Africa
  }

  const locale = navigator.language || 'en-ZA';
  
  if (locale.includes('ZA')) return 'ZAR';
  if (locale.includes('US')) return 'USD';
  if (locale.includes('GB')) return 'GBP';
  if (locale.includes('EU') || locale.includes('DE') || locale.includes('FR')) return 'EUR';
  
  return 'ZAR'; // Default to ZAR
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  
  // Convert to USD first (base currency)
  const amountInUSD = amount / EXCHANGE_RATES[from];
  
  // Then convert to target currency
  const convertedAmount = amountInUSD * EXCHANGE_RATES[to];
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimals
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  options: Intl.NumberFormatOptions = {}
): string {
  const config = CURRENCIES[currency];
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Get quick donation amounts for a currency
 */
export function getQuickAmounts(currency: Currency): number[] {
  const baseAmounts = [10, 25, 50, 100, 250]; // USD amounts
  
  if (currency === 'USD') return baseAmounts;
  
  // Convert to local currency and round to nice numbers
  return baseAmounts.map(amount => {
    const converted = convertCurrency(amount, 'USD', currency);
    
    // Round to nice numbers
    if (currency === 'ZAR') {
      if (converted < 100) return Math.round(converted / 10) * 10;
      if (converted < 1000) return Math.round(converted / 50) * 50;
      return Math.round(converted / 100) * 100;
    }
    
    return Math.round(converted);
  });
}

/**
 * Convert local currency amount to USD for PayPal
 */
export function toPayPalAmount(amount: number, fromCurrency: Currency): number {
  return convertCurrency(amount, fromCurrency, 'USD');
}

/**
 * Parse currency symbol from string
 */
export function parseCurrencySymbol(symbol: string): Currency {
  switch (symbol) {
    case 'R':
      return 'ZAR';
    case '$':
      return 'USD';
    case '€':
      return 'EUR';
    case '£':
      return 'GBP';
    default:
      return 'ZAR';
  }
}

/**
 * Get currency info message for PayPal conversion
 */
export function getConversionMessage(
  localAmount: number,
  localCurrency: Currency
): string {
  if (localCurrency === 'USD') {
    return '';
  }
  
  const usdAmount = toPayPalAmount(localAmount, localCurrency);
  const config = CURRENCIES[localCurrency];
  
  return `You will be charged ${formatCurrency(localAmount, localCurrency)} (approximately ${formatCurrency(usdAmount, 'USD')} USD)`;
}
