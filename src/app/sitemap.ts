// apps/web/app/sitemap.ts
import type { MetadataRoute } from 'next'

/**
 * Only list public pages:
 *   /, /tools/*, /privacy, /terms
 * Add tool pages here as you ship them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://theinboxguard.com').replace(/\/+$/, '')
  const now = new Date()

  // Start with what exists today. If only "/" exists, that's fine.
  const publicPaths = [
    '/',            // landing (marketing)
    '/tools/spf',   // SPF checker tool
    '/tools/header-tester', // Header tester tool
    '/tools/spam-explainer', // Spam rate explainer tool
    // '/privacy',
    // '/terms',
  ]

  return publicPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: path === '/' ? 1 : 0.7,
  }))
} 