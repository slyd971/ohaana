import { jsonLdString } from '@/lib/seo'

/** Données structurées d'une page (un ou plusieurs nœuds regroupés dans un @graph). */
export function JsonLd({ nodes }: { nodes: Record<string, unknown>[] }) {
  if (nodes.length === 0) return null
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString({ '@context': 'https://schema.org', '@graph': nodes }) }}
    />
  )
}
