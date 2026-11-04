import { ProviderShell } from '@/components/layout/shells/ProviderShell'
import { requireRole } from '@/lib/auth/session'

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
