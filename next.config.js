/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['replicate.delivery', 'pbxt.replicate.delivery', 'localhost', 'picsum.photos'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  // Skip static generation for auth-related pages
  async generateStaticParams() {
    return []
  },
  // Disable static generation for pages that use auth
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;