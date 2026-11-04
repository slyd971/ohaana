import { AdminShell } from '@/components/layout/shells/AdminShell'
import { requireRole } from '@/lib/auth/session'

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
