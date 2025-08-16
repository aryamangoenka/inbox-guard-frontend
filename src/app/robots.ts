// apps/web/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '') ?? 'https://theinboxguard.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tools/'],
        disallow: ['/dashboard/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
} 