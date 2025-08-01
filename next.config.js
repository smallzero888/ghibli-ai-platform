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
    // 在 Vercel 环境下，不需要重写 API 请求
    if (process.env.VERCEL) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  // Disable static generation for pages that use auth
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // 避免静态生成问题
  output: 'standalone',
};

module.exports = nextConfig;
