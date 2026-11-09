import { ProviderShell } from '@/components/layout/shells/ProviderShell'
import { requireRole } from '@/lib/auth/session'
import type { Metadata } from 'next'
import { PRIVATE_METADATA } from '@/lib/seo'

// Espace privé : jamais indexé.
export const metadata: Metadata = PRIVATE_METADATA

export default async function ProviderLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireRole(['provider', 'admin'], locale)
  return <ProviderShell>{children}</ProviderShell>
}
