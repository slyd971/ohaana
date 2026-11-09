import { AdminShell } from '@/components/layout/shells/AdminShell'
import { requireRole } from '@/lib/auth/session'
import type { Metadata } from 'next'
import { PRIVATE_METADATA } from '@/lib/seo'

// Espace privé : jamais indexé.
export const metadata: Metadata = PRIVATE_METADATA

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireRole(['admin'], locale)
  return <AdminShell>{children}</AdminShell>
}
