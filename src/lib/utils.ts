// Utility functions for the application

/**
 * Format currency to USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format date to short format (MM/DD/YYYY) - consistent across server/client
 */
export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Check if user is admin
 */
export function isAdmin(userType: string): boolean {
  return userType === 'ADMIN';
}

/**
 * Check if user is donor
 */
export function isDonor(userType: string): boolean {
  return userType === 'DONOR';
}

/**
 * Check if user is requester
 */
export function isRequester(userType: string): boolean {
  return userType === 'REQUESTER';
}

/**
 * Get urgency color class
 */
export function getUrgencyColor(urgency: string): string {
  const colors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };
  return colors[urgency] || colors.MEDIUM;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    PARTIALLY_FUNDED: 'bg-blue-100 text-blue-800',
    FUNDED: 'bg-purple-100 text-purple-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return colors[status] || colors.PENDING;
}

/**
 * Format category label
 */
export function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Share URL (native share or fallback)
 */
export async function shareUrl(url: string, title: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return true;
    } catch (err) {
      console.error('Share failed:', err);
      return false;
    }
  } else {
    return copyToClipboard(url);
  }
}

/**
 * Get approximate/privacy-friendly location from full address
 * Returns only city, state/province, and country - no street addresses
 */
export function getApproximateLocation(fullAddress: string | null | undefined): string {
  if (!fullAddress) return 'Location not specified';
  
  // Split by comma and clean up
  const parts = fullAddress.split(',').map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 0) return 'Location not specified';
  if (parts.length === 1) return parts[0];
  
  // Try to identify and remove street-level details
  // Usually: Street Number, Street Name, City, State/Province, Country, Postal Code
  
  // Remove parts that look like street addresses or postal codes
  const filteredParts = parts.filter(part => {
    // Skip if it starts with a number (likely street address)
    if (/^\d+\s/.test(part)) return false;
    // Skip if it's just a postal code
    if (/^\d{4,6}$/.test(part)) return false;
    if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(part)) return false; // Canadian postal
    if (/^\d{5}(-\d{4})?$/.test(part)) return false; // US ZIP
    // Skip common street indicators
    if (/^(unit|apt|suite|floor|building|blk|block)\s/i.test(part)) return false;
    // Skip if contains "Street", "Road", "Avenue", etc.
    if (/\b(street|st|road|rd|avenue|ave|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl|crescent|cres)\b/i.test(part)) return false;
    return true;
  });
  
  // If we filtered everything, return last 2-3 parts of original (likely city, country)
  if (filteredParts.length === 0) {
    return parts.slice(-Math.min(3, parts.length)).join(', ');
  }
  
  // Return last 2-3 parts (city, state, country)
  return filteredParts.slice(-Math.min(3, filteredParts.length)).join(', ');
}

/**
 * Extract coordinates from Google Maps URL or address for embedding
 */
export function getMapEmbedUrl(location: string | null | undefined): string | null {
  if (!location) return null;
  
  // Use Google Maps embed with place query (approximate, privacy-friendly)
  const approximateLocation = getApproximateLocation(location);
  const encodedLocation = encodeURIComponent(approximateLocation);
  
  return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodedLocation}&zoom=12`;
}
