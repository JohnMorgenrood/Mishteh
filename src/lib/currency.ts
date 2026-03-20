// Currency conversion and localization utilities

export type Currency = 'USD' | 'ZAR' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'NGN' | 'KES' | 'GHS' | 'UGX';

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
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    locale: 'en-AU',
    name: 'Australian Dollar',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    locale: 'en-CA',
    name: 'Canadian Dollar',
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    locale: 'en-NG',
    name: 'Nigerian Naira',
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    locale: 'en-KE',
    name: 'Kenyan Shilling',
  },
  GHS: {
    code: 'GHS',
    symbol: 'GH₵',
    locale: 'en-GH',
    name: 'Ghanaian Cedi',
  },
  UGX: {
    code: 'UGX',
    symbol: 'USh',
    locale: 'en-UG',
    name: 'Ugandan Shilling',
  },
};

// Exchange rates (update these regularly or use an API)
// Base currency is USD
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  ZAR: 18.50,   // 1 USD = 18.50 ZAR (South African Rand)
  EUR: 0.92,    // 1 USD = 0.92 EUR (Euro)
  GBP: 0.79,    // 1 USD = 0.79 GBP (British Pound)
  AUD: 1.52,    // 1 USD = 1.52 AUD (Australian Dollar)
  CAD: 1.36,    // 1 USD = 1.36 CAD (Canadian Dollar)
  NGN: 1620,    // 1 USD = 1620 NGN (Nigerian Naira)
  KES: 129,     // 1 USD = 129 KES (Kenyan Shilling)
  GHS: 15.50,   // 1 USD = 15.50 GHS (Ghanaian Cedi)
  UGX: 3700,    // 1 USD = 3700 UGX (Ugandan Shilling)
};

/**
 * Detect user's currency based on location/locale
 */
export function detectUserCurrency(): Currency {
  if (typeof window === 'undefined') {
    return 'ZAR';
  }

  const locales = [
    ...(navigator.languages || []),
    navigator.language,
  ]
    .filter(Boolean)
    .map(locale => locale.toUpperCase());

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.toUpperCase() || '';

  if (timeZone.includes('JOHANNESBURG') || locales.some(locale => locale.includes('-ZA') || locale.endsWith('ZA'))) {
    return 'ZAR';
  }

  if (locales.some(locale => locale.includes('-NG') || locale.endsWith('NG'))) return 'NGN';
  if (locales.some(locale => locale.includes('-KE') || locale.endsWith('KE'))) return 'KES';
  if (locales.some(locale => locale.includes('-GH') || locale.endsWith('GH'))) return 'GHS';
  if (locales.some(locale => locale.includes('-UG') || locale.endsWith('UG'))) return 'UGX';
  if (locales.some(locale => locale.includes('-US') || locale.endsWith('US'))) return 'USD';
  if (locales.some(locale => locale.includes('-GB') || locale.endsWith('GB'))) return 'GBP';
  if (locales.some(locale => locale.includes('-AU') || locale.endsWith('AU'))) return 'AUD';
  if (locales.some(locale => locale.includes('-CA') || locale.endsWith('CA'))) return 'CAD';
  if (locales.some(locale => locale.includes('-DE') || locale.endsWith('DE') || locale.includes('-FR') || locale.endsWith('FR') || locale.includes('EU'))) {
    return 'EUR';
  }

  return 'ZAR';
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
    
    // Round to nice numbers based on currency
    if (currency === 'ZAR' || currency === 'GHS') {
      // For Rand and Cedi
      if (converted < 100) return Math.round(converted / 10) * 10;
      if (converted < 1000) return Math.round(converted / 50) * 50;
      return Math.round(converted / 100) * 100;
    }
    
    if (currency === 'NGN' || currency === 'UGX') {
      // For Naira and Ugandan Shilling (larger numbers)
      if (converted < 1000) return Math.round(converted / 100) * 100;
      if (converted < 10000) return Math.round(converted / 500) * 500;
      return Math.round(converted / 1000) * 1000;
    }
    
    if (currency === 'KES') {
      // For Kenyan Shilling
      if (converted < 500) return Math.round(converted / 50) * 50;
      if (converted < 5000) return Math.round(converted / 100) * 100;
      return Math.round(converted / 500) * 500;
    }
    
    // For other currencies (EUR, GBP, AUD, CAD)
    if (converted < 10) return Math.round(converted);
    if (converted < 100) return Math.round(converted / 5) * 5;
    return Math.round(converted / 10) * 10;
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
    case 'A$':
      return 'AUD';
    case 'C$':
      return 'CAD';
    case '₦':
      return 'NGN';
    case 'KSh':
      return 'KES';
    case 'GH₵':
      return 'GHS';
    case 'USh':
      return 'UGX';
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
