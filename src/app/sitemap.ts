import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mishal-legal.sa';
  return [
    { url: `${appUrl}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
