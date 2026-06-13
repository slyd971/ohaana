// Root route — next-intl middleware rewrites / → app/[locale]/(tourist)/page.tsx with locale='fr'
// No redirect needed here; a redirect to /fr would loop (as-needed strips the default prefix).
export default function RootPage() {
  return null
}
