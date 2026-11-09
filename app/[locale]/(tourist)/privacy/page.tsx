import type { Metadata } from 'next'
import { LegalDocumentPage } from '@/components/legal/LegalDocument'
import { buildMetadata, toSeoLocale } from '@/lib/seo'
import { PAGE_SEO } from '@/lib/seo/pages'
import { privacySections } from '@/lib/legal/content/privacy'

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toSeoLocale((await params).locale)
  const { title, description } = PAGE_SEO.privacy[locale]
  return buildMetadata({ title, description, path: '/privacy', locale })
}

export default async function Page({ params }: { params: Params }) {
  const locale = toSeoLocale((await params).locale)
  return <LegalDocumentPage locale={locale} doc={'privacy'} title="Politique de confidentialité" sections={privacySections()} />
}
