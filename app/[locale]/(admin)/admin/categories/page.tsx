import { getAdminContext } from '@/lib/admin/context'
import { CategoryForm, type CategoryRow } from '@/components/admin/CategoryForm'

export default async function AdminCategoriesPage() {
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') {
    return <div className="p-5 md:p-8 text-white/50 text-sm">Mode démo : la gestion des catégories est désactivée.</div>
  }
  if (ctx.kind !== 'admin') return null

  const { data } = await ctx.supabase
    .from('service_categories')
    .select('id, slug, name_fr, name_en, name_es, icon, color, sort_order, is_active')
    .order('sort_order')
  const categories = (data ?? []) as CategoryRow[]

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display text-white">Catégories</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {categories.length} catégories. L’identifiant (slug) est fixé à la création : il sert aux liens et aux filtres.
        </p>
      </div>

      <details className="bg-white/5 rounded-card border border-white/8">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-turquoise">+ Nouvelle catégorie</summary>
        <div className="bg-sand rounded-b-2xl p-4">
          <CategoryForm submitLabel="Créer la catégorie" />
        </div>
      </details>

      <ul className="space-y-3">
        {categories.map((c) => (
          <li key={c.id}>
            <details className="bg-white/5 rounded-card border border-white/8">
              <summary className="cursor-pointer px-5 py-4 flex items-center justify-between gap-3 text-sm text-white">
                <span>
                  <span aria-hidden className="mr-2">{c.icon}</span>
                  {c.name_fr}
                  <span className="ml-2 text-xs text-white/40">{c.slug} · ordre {c.sort_order}</span>
                </span>
                {!c.is_active && <span className="text-xs rounded-full bg-white/10 text-white/60 px-2 py-0.5">Masquée</span>}
              </summary>
              <div className="bg-sand rounded-b-2xl p-4">
                <CategoryForm category={c} submitLabel="Enregistrer" />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}
