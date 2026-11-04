import { ConciergeShell } from '@/components/layout/shells/ConciergeShell'
import { requireRole } from '@/lib/auth/session'

export default async function ConciergeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireRole(['concierge', 'admin'], locale)
  return <ConciergeShell>{children}</ConciergeShell>
}
