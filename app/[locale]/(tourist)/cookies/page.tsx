import type { Metadata } from 'next'
import { LegalDocumentPage } from '@/components/legal/LegalDocument'
import { buildMetadata, toSeoLocale } from '@/lib/seo'
import { PAGE_SEO } from '@/lib/seo/pages'
import { cookiesSections } from '@/lib/legal/content/cookies'

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toSeoLocale((await params).locale)
  const { title, description } = PAGE_SEO.cookies[locale]
  return buildMetadata({ title, description, path: '/cookies', locale })
}

export default async function Page({ params }: { params: Params }) {
  const locale = toSeoLocale((await params).locale)
  return <LegalDocumentPage locale={locale} doc={null} title="Politique de cookies" sections={cookiesSections()} />
}
