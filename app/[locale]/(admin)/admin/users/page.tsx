import { Button } from '@/components/ui/Button'
import { Link } from '@/lib/i18n/navigation'
import { getAdminContext } from '@/lib/admin/context'
import { UserRowActions } from '@/components/admin/UserRowActions'
import { ROLE_LABELS, USER_ROLES, type AssignableRole } from '@/lib/admin/schemas'

interface Row {
  id: string
  email: string
  full_name: string | null
  role: AssignableRole
  is_active: boolean
  is_demo: boolean | null
  created_at: string
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; demo?: string }> }) {
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') {
    return <div className="p-5 md:p-8 text-white/50 text-sm">Mode démo : la gestion des utilisateurs est désactivée.</div>
  }
  if (ctx.kind !== 'admin') return null

  const { q = '', role = '', demo = '' } = await searchParams
  // Seuls des caractères sûrs entrent dans le filtre PostgREST (pas de virgule, parenthèse ni joker).
  const term = q.replace(/[^\p{L}\p{N}@.\- ]/gu, '').trim().slice(0, 60)

  let query = ctx.supabase
    .from('users')
    .select('id, email, full_name, role, is_active, is_demo, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (term) query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`)
  if ((USER_ROLES as readonly string[]).includes(role)) query = query.eq('role', role)
  if (demo !== '1') query = query.not('is_demo', 'is', true)

  const { data, error } = await query
  const users = (data ?? []) as Row[]

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display text-white">Utilisateurs</h1>
        <p className="text-white/40 text-sm mt-0.5">{users.length} compte{users.length > 1 ? 's' : ''} affiché{users.length > 1 ? 's' : ''} (100 maximum)</p>
      </div>

      <form method="get" className="flex flex-col sm:flex-row gap-3" role="search">
        <div className="flex-1 max-w-sm">
          <label htmlFor="q" className="sr-only">Rechercher un utilisateur</label>
          <input
            id="q"
            name="q"
            defaultValue={term}
            placeholder="Nom ou e-mail…"
            className="w-full bg-white/5 border border-white/10 rounded-control px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-turquoise/50"
          />
        </div>
        <label htmlFor="role" className="sr-only">Filtrer par rôle</label>
        <select id="role" name="role" defaultValue={role} className="bg-white/5 border border-white/10 rounded-control px-3 py-2.5 text-sm text-white">
          <option value="" className="text-black">Tous les rôles</option>
          {USER_ROLES.map((r) => (
            <option key={r} value={r} className="text-black">{ROLE_LABELS[r]}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-white/60">
          <input type="checkbox" name="demo" value="1" defaultChecked={demo === '1'} className="h-4 w-4" />
          Inclure les comptes de démo
        </label>
        <Button variant="soft" size="bare" type="submit" className="text-sm px-4 py-2.5 rounded-control">
          Filtrer
        </Button>
        {(term || role || demo) && (
          <Link href="/admin/users" className="text-sm text-white/50 hover:text-white/80 self-center">Réinitialiser</Link>
        )}
      </form>

      {error && <p role="alert" className="text-sm text-red-400">Impossible de charger les utilisateurs.</p>}

      <div className="bg-white/5 rounded-card border border-white/8 overflow-hidden">
        {users.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/40">Aucun utilisateur.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {users.map((u) => (
              <li key={u.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {u.full_name || u.email}
                    {!u.is_active && <span className="ml-2 text-xs rounded-full bg-red-400/15 text-red-300 px-2 py-0.5">Désactivé</span>}
                    {u.is_demo && <span className="ml-2 text-xs rounded-full bg-white/10 text-white/60 px-2 py-0.5">Démo</span>}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {u.email} · inscrit le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(u.created_at))}
                  </p>
                </div>
                <UserRowActions userId={u.id} name={u.full_name || u.email} role={u.role} active={u.is_active} isSelf={u.id === ctx.userId} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
