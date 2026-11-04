import { PartnerShell } from '@/components/layout/shells/PartnerShell'
import { requireRole } from '@/lib/auth/session'

export default async function PartnerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireRole(['partner', 'concierge', 'admin'], locale)
  return <PartnerShell>{children}</PartnerShell>
}
