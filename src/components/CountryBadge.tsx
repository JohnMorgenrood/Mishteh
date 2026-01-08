'use client';

// Country code to flag emoji and name mapping
const COUNTRY_DATA: Record<string, { flag: string; name: string }> = {
  // Africa
  ZA: { flag: '🇿🇦', name: 'South Africa' },
  NG: { flag: '🇳🇬', name: 'Nigeria' },
  KE: { flag: '🇰🇪', name: 'Kenya' },
  EG: { flag: '🇪🇬', name: 'Egypt' },
  GH: { flag: '🇬🇭', name: 'Ghana' },
  TZ: { flag: '🇹🇿', name: 'Tanzania' },
  ET: { flag: '🇪🇹', name: 'Ethiopia' },
  UG: { flag: '🇺🇬', name: 'Uganda' },
  ZW: { flag: '🇿🇼', name: 'Zimbabwe' },
  BW: { flag: '🇧🇼', name: 'Botswana' },
  NA: { flag: '🇳🇦', name: 'Namibia' },
  MZ: { flag: '🇲🇿', name: 'Mozambique' },
  ZM: { flag: '🇿🇲', name: 'Zambia' },
  MW: { flag: '🇲🇼', name: 'Malawi' },
  SZ: { flag: '🇸🇿', name: 'Eswatini' },
  LS: { flag: '🇱🇸', name: 'Lesotho' },
  MU: { flag: '🇲🇺', name: 'Mauritius' },
  RW: { flag: '🇷🇼', name: 'Rwanda' },
  SN: { flag: '🇸🇳', name: 'Senegal' },
  CI: { flag: '🇨🇮', name: 'Ivory Coast' },
  CM: { flag: '🇨🇲', name: 'Cameroon' },
  AO: { flag: '🇦🇴', name: 'Angola' },
  MA: { flag: '🇲🇦', name: 'Morocco' },
  DZ: { flag: '🇩🇿', name: 'Algeria' },
  TN: { flag: '🇹🇳', name: 'Tunisia' },
  
  // Europe
  GB: { flag: '🇬🇧', name: 'United Kingdom' },
  UK: { flag: '🇬🇧', name: 'United Kingdom' },
  DE: { flag: '🇩🇪', name: 'Germany' },
  FR: { flag: '🇫🇷', name: 'France' },
  IT: { flag: '🇮🇹', name: 'Italy' },
  ES: { flag: '🇪🇸', name: 'Spain' },
  NL: { flag: '🇳🇱', name: 'Netherlands' },
  BE: { flag: '🇧🇪', name: 'Belgium' },
  PT: { flag: '🇵🇹', name: 'Portugal' },
  CH: { flag: '🇨🇭', name: 'Switzerland' },
  AT: { flag: '🇦🇹', name: 'Austria' },
  SE: { flag: '🇸🇪', name: 'Sweden' },
  NO: { flag: '🇳🇴', name: 'Norway' },
  DK: { flag: '🇩🇰', name: 'Denmark' },
  FI: { flag: '🇫🇮', name: 'Finland' },
  PL: { flag: '🇵🇱', name: 'Poland' },
  IE: { flag: '🇮🇪', name: 'Ireland' },
  GR: { flag: '🇬🇷', name: 'Greece' },
  CZ: { flag: '🇨🇿', name: 'Czech Republic' },
  RO: { flag: '🇷🇴', name: 'Romania' },
  HU: { flag: '🇭🇺', name: 'Hungary' },
  UA: { flag: '🇺🇦', name: 'Ukraine' },
  RU: { flag: '🇷🇺', name: 'Russia' },
  
  // Americas
  US: { flag: '🇺🇸', name: 'United States' },
  CA: { flag: '🇨🇦', name: 'Canada' },
  MX: { flag: '🇲🇽', name: 'Mexico' },
  BR: { flag: '🇧🇷', name: 'Brazil' },
  AR: { flag: '🇦🇷', name: 'Argentina' },
  CO: { flag: '🇨🇴', name: 'Colombia' },
  CL: { flag: '🇨🇱', name: 'Chile' },
  PE: { flag: '🇵🇪', name: 'Peru' },
  VE: { flag: '🇻🇪', name: 'Venezuela' },
  EC: { flag: '🇪🇨', name: 'Ecuador' },
  UY: { flag: '🇺🇾', name: 'Uruguay' },
  PY: { flag: '🇵🇾', name: 'Paraguay' },
  BO: { flag: '🇧🇴', name: 'Bolivia' },
  JM: { flag: '🇯🇲', name: 'Jamaica' },
  TT: { flag: '🇹🇹', name: 'Trinidad and Tobago' },
  
  // Asia
  CN: { flag: '🇨🇳', name: 'China' },
  JP: { flag: '🇯🇵', name: 'Japan' },
  KR: { flag: '🇰🇷', name: 'South Korea' },
  IN: { flag: '🇮🇳', name: 'India' },
  ID: { flag: '🇮🇩', name: 'Indonesia' },
  MY: { flag: '🇲🇾', name: 'Malaysia' },
  SG: { flag: '🇸🇬', name: 'Singapore' },
  TH: { flag: '🇹🇭', name: 'Thailand' },
  VN: { flag: '🇻🇳', name: 'Vietnam' },
  PH: { flag: '🇵🇭', name: 'Philippines' },
  PK: { flag: '🇵🇰', name: 'Pakistan' },
  BD: { flag: '🇧🇩', name: 'Bangladesh' },
  LK: { flag: '🇱🇰', name: 'Sri Lanka' },
  NP: { flag: '🇳🇵', name: 'Nepal' },
  AE: { flag: '🇦🇪', name: 'UAE' },
  SA: { flag: '🇸🇦', name: 'Saudi Arabia' },
  IL: { flag: '🇮🇱', name: 'Israel' },
  TR: { flag: '🇹🇷', name: 'Turkey' },
  HK: { flag: '🇭🇰', name: 'Hong Kong' },
  TW: { flag: '🇹🇼', name: 'Taiwan' },
  
  // Oceania
  AU: { flag: '🇦🇺', name: 'Australia' },
  NZ: { flag: '🇳🇿', name: 'New Zealand' },
  FJ: { flag: '🇫🇯', name: 'Fiji' },
};

// Extract country from location string
export function extractCountryFromLocation(location: string | null | undefined): { code: string | null; name: string | null; flag: string | null } {
  if (!location) return { code: null, name: null, flag: null };
  
  const locationLower = location.toLowerCase();
  
  // Try to find country by name in location
  for (const [code, data] of Object.entries(COUNTRY_DATA)) {
    if (locationLower.includes(data.name.toLowerCase())) {
      return { code, name: data.name, flag: data.flag };
    }
  }
  
  // Try common variations
  const variations: Record<string, string> = {
    'south africa': 'ZA',
    'usa': 'US',
    'america': 'US',
    'united states': 'US',
    'uk': 'GB',
    'england': 'GB',
    'britain': 'GB',
    'johannesburg': 'ZA',
    'cape town': 'ZA',
    'durban': 'ZA',
    'pretoria': 'ZA',
    'lagos': 'NG',
    'nairobi': 'KE',
    'london': 'GB',
    'new york': 'US',
    'los angeles': 'US',
    'sydney': 'AU',
    'melbourne': 'AU',
    'toronto': 'CA',
    'vancouver': 'CA',
    'paris': 'FR',
    'berlin': 'DE',
    'mumbai': 'IN',
    'delhi': 'IN',
    'bangalore': 'IN',
    'dubai': 'AE',
    'singapore': 'SG',
    'hong kong': 'HK',
    'tokyo': 'JP',
  };
  
  for (const [city, code] of Object.entries(variations)) {
    if (locationLower.includes(city)) {
      const data = COUNTRY_DATA[code];
      return { code, name: data.name, flag: data.flag };
    }
  }
  
  return { code: null, name: null, flag: null };
}

interface CountryBadgeProps {
  location: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export default function CountryBadge({ location, size = 'sm', showName = false, className = '' }: CountryBadgeProps) {
  const country = extractCountryFromLocation(location);
  
  if (!country.flag) return null;
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  return (
    <span 
      className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${className}`}
      title={country.name || undefined}
    >
      <span className="leading-none">{country.flag}</span>
      {showName && <span className="text-gray-600 text-xs">{country.name}</span>}
    </span>
  );
}

// Compact badge for cards
export function CountryFlag({ location, className = '' }: { location: string | null | undefined; className?: string }) {
  const country = extractCountryFromLocation(location);
  
  if (!country.flag) return null;
  
  return (
    <span 
      className={`text-base leading-none ${className}`}
      title={country.name || undefined}
    >
      {country.flag}
    </span>
  );
}
