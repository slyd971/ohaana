import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  // Demo deployments (NEXT_PUBLIC_DEMO_MODE=true) must never be crawled.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/partner/', '/api/', '/admin/', '/provider/', '/reserver/',
          '/profile', '/voyages', '/paiement', '/notifications', '/settings', '/preferences', '/onboarding',
          '/login', '/register', '/reset-password', '/update-password',
          '/en/partner/', '/en/admin/', '/en/provider/', '/en/reserver/',
          '/es/partner/', '/es/admin/', '/es/provider/', '/es/reserver/',
          // Filtres et tris de la recherche : des milliers de variantes sans valeur propre, l'URL de base suffit.
          '/*?*sort=', '/*?*price=', '/*?*page=', '/*?*island=', '/*?*cat=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
