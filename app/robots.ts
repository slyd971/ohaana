import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/partner/', '/api/', '/admin/', '/reserver/'],
      },
    ],
    sitemap: 'https://ohaana.com/sitemap.xml',
  }
}
