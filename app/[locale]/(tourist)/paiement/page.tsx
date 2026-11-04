import { redirect } from '@/lib/i18n/navigation'

// Preferences and payment methods now live in the account space (/profile).
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: '/profile', locale })
}
