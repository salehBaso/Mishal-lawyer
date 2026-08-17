/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb', // يسمح برفع مستندات قانونية كبيرة نسبيًا
    },
  },
  images: {
    // نطاقات تخزين الكائنات (S3-compatible) المسموح بها لعرض الصور/المرفقات
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'localhost' },
    ],
  },
  async headers() {
    return [
      {
        // رؤوس أمان أساسية على مستوى التطبيق (طبقة إضافية فوق middleware)
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
