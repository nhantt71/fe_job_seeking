/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Suppress hydration warnings caused by browser extensions
  compiler: {
    styledComponents: true,
    // Ignore specific attributes added by browser extensions
    ignoreBrowserExtensionWarnings: true,
  },
  onDemandEntries: {
    // Don't dispose inactive pages
    maxInactiveAge: 25 * 1000,
    // Keep 5 pages in memory
    pagesBufferLength: 5,
  },
  // Suppress hydration warnings
  experimental: {
    suppressHydrationWarning: true,
    // Allow mismatched hydration attributes for better compatibility
    allowMismatchedHydration: true,
  },
  // Configure React to ignore specific attributes during hydration
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  // Add custom HTML attributes to the list of allowed attributes
  // This helps prevent hydration mismatches from browser extensions
  images: {
    dangerouslyAllowSVG: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
    ];
  },
};  

module.exports = nextConfig; 