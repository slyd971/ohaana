import type { Metadata } from 'next'
import { LegalDocumentPage } from '@/components/legal/LegalDocument'
import { buildMetadata, toSeoLocale } from '@/lib/seo'
import { PAGE_SEO } from '@/lib/seo/pages'
import { legalNoticeSections } from '@/lib/legal/content/legal-notice'

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toSeoLocale((await params).locale)
  const { title, description } = PAGE_SEO.legal[locale]
  return buildMetadata({ title, description, path: '/legal', locale })
}

export default async function Page({ params }: { params: Params }) {
  const locale = toSeoLocale((await params).locale)
  return <LegalDocumentPage locale={locale} doc={null} title="Mentions légales" sections={legalNoticeSections()} />
}
