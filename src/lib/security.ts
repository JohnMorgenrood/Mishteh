// Security tracking utilities
// Captures IP addresses, geolocation, and security events

import { headers } from 'next/headers';
import { prisma } from './prisma';

// Security event types
export type SecurityEventType = 
  | 'SIGNUP_CREDENTIALS'
  | 'SIGNUP_GOOGLE'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET'
  | 'SUSPICIOUS_ACTIVITY'
  | 'ADMIN_ACCESS_DENIED';

// Geolocation data from IP
export interface GeoLocation {
  ip: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  timezone?: string;
  isp?: string;
  org?: string;
  isVpn?: boolean;
  isProxy?: boolean;
  isTor?: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Get the client's real IP address from request headers
 */
export function getClientIP(request?: Request): string {
  try {
    if (request) {
      // Check various headers that might contain the real IP
      const forwarded = request.headers.get('x-forwarded-for');
      if (forwarded) {
        return forwarded.split(',')[0].trim();
      }
      
      const realIp = request.headers.get('x-real-ip');
      if (realIp) {
        return realIp;
      }
      
      const cfIp = request.headers.get('cf-connecting-ip'); // Cloudflare
      if (cfIp) {
        return cfIp;
      }
    }
    
    // Fallback - try to get from headers() in server components
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    const realIp = headersList.get('x-real-ip');
    if (realIp) {
      return realIp;
    }
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get geolocation data from IP address using free API
 * Uses ip-api.com (free tier allows 45 requests/minute)
 */
export async function getGeoLocation(ip: string): Promise<GeoLocation> {
  const result: GeoLocation = { ip };
  
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
    return { ...result, country: 'Localhost', city: 'Development' };
  }
  
  try {
    // Use ip-api.com free service
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          ip,
          country: data.country,
          countryCode: data.countryCode,
          region: data.regionName,
          city: data.city,
          timezone: data.timezone,
          isp: data.isp,
          org: data.org,
          isVpn: data.hosting || false,
          isProxy: data.proxy || false,
          latitude: data.lat,
          longitude: data.lon,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching geolocation:', error);
  }
  
  return result;
}

/**
 * Log a security event to the database
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  userId: string | null,
  email: string,
  ip: string,
  geoLocation: GeoLocation,
  userAgent?: string,
  details?: string
): Promise<void> {
  try {
    await prisma.securityLog.create({
      data: {
        eventType,
        userId,
        email,
        ipAddress: ip,
        country: geoLocation.country,
        countryCode: geoLocation.countryCode,
        city: geoLocation.city,
        region: geoLocation.region,
        timezone: geoLocation.timezone,
        isp: geoLocation.isp,
        isVpn: geoLocation.isVpn || false,
        isProxy: geoLocation.isProxy || false,
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
        userAgent: userAgent?.substring(0, 500), // Limit length
        details,
      },
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - security logging shouldn't break the main flow
  }
}

/**
 * Check for suspicious patterns
 */
export async function checkSuspiciousActivity(
  email: string,
  ip: string,
  geoLocation: GeoLocation
): Promise<{ suspicious: boolean; reasons: string[] }> {
  const reasons: string[] = [];
  
  // Check if using VPN/Proxy
  if (geoLocation.isVpn || geoLocation.isProxy) {
    reasons.push('Using VPN or Proxy');
  }
  
  // Check for multiple accounts from same IP in last 24 hours
  const recentFromIP = await prisma.securityLog.count({
    where: {
      ipAddress: ip,
      eventType: { in: ['SIGNUP_CREDENTIALS', 'SIGNUP_GOOGLE'] },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  
  if (recentFromIP >= 3) {
    reasons.push(`Multiple signups from same IP (${recentFromIP} in 24h)`);
  }
  
  // Check for failed login attempts
  const failedLogins = await prisma.securityLog.count({
    where: {
      email,
      eventType: 'LOGIN_FAILED',
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    },
  });
  
  if (failedLogins >= 5) {
    reasons.push(`Multiple failed login attempts (${failedLogins} in 1h)`);
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Get user agent from request
 */
export function getUserAgent(request?: Request): string {
  try {
    if (request) {
      return request.headers.get('user-agent') || 'unknown';
    }
    const headersList = headers();
    return headersList.get('user-agent') || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Update user with their signup location info
 */
export async function updateUserSecurityInfo(
  userId: string,
  ip: string,
  geoLocation: GeoLocation
): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        signupIp: ip,
        signupCountry: geoLocation.country,
        signupCity: geoLocation.city,
        lastLoginIp: ip,
        lastLoginAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to update user security info:', error);
  }
}
