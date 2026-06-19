import type { MetadataRoute } from 'next'
import { DUMMY_PRODUCTS } from '@/lib/data/products'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://figbox.store'
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/cart`, lastModified: now, changeFrequency: 'never', priority: 0.1 },
  ]

  const productRoutes: MetadataRoute.Sitemap = DUMMY_PRODUCTS.map(p => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
