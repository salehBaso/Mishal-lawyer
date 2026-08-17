import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mishal-legal.sa';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/cases', '/documents', '/settings', '/api'] },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
