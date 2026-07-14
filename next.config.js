/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/api/user/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store' }] },
      { source: '/api/admin/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store' }] },
      { source: '/api/documents', headers: [{ key: 'Cache-Control', value: 'private, no-store' }] },
    ];
  },
};

module.exports = nextConfig;
