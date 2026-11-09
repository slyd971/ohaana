import type { Metadata } from 'next'
import { PRIVATE_METADATA } from '@/lib/seo'

// Espace privé : jamais indexé.
export const metadata: Metadata = PRIVATE_METADATA

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
