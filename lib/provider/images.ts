import type { SupabaseClient } from '@supabase/supabase-js'
import type { ActionState } from './schemas'

export const IMAGE_BUCKET = 'service-images'
export const MIN_PHOTOS = 3
export const MAX_PHOTOS = 10

export interface ServiceImage {
  id: string
  url: string
  alt_fr: string | null
  sort_order: number
  is_cover: boolean
}

export type ImageOp =
  | { op: 'add'; serviceId: string; path: string; alt: string }
  | { op: 'alt'; serviceId: string; imageId: string; alt: string }
  | { op: 'cover'; serviceId: string; imageId: string }
  | { op: 'move'; serviceId: string; imageId: string; dir: 'up' | 'down' }
  | { op: 'delete'; serviceId: string; imageId: string }

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const PATH_RE = new RegExp(`^(${UUID})/(${UUID})/(${UUID})\\.(jpg|jpeg|png|webp)$`, 'i')

export async function listServiceImages(supabase: SupabaseClient, serviceId: string): Promise<ServiceImage[]> {
  const { data } = await supabase
    .from('service_images')
    .select('id, url, alt_fr, sort_order, is_cover')
    .eq('service_id', serviceId)
    .order('sort_order')
  return (data ?? []) as ServiceImage[]
}

export async function countServiceImages(supabase: SupabaseClient, serviceId: string): Promise<number> {
  const { count } = await supabase.from('service_images').select('id', { count: 'exact', head: true }).eq('service_id', serviceId)
  return count ?? 0
}

function cleanAlt(alt: unknown): string | null {
  const v = typeof alt === 'string' ? alt.trim() : ''
  return v.length >= 3 && v.length <= 200 ? v : null
}

/** Chemin d'objet Storage à partir de l'URL publique (pour supprimer le fichier avec sa ligne). */
function objectPathFromUrl(url: string): string | null {
  const marker = `/object/public/${IMAGE_BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

/**
 * Applique une opération sur les photos d'un service. L'appelant a DÉJÀ vérifié que l'utilisateur peut
 * gérer ce service (propriétaire ou admin) ; ici on ne fait confiance à aucune URL envoyée par le navigateur :
 * l'URL publique est recalculée côté serveur à partir d'un chemin dont on contrôle le préfixe.
 */
export async function applyImageOp(
  supabase: SupabaseClient,
  service: { id: string; provider_id: string },
  input: ImageOp,
): Promise<ActionState> {
  const images = await listServiceImages(supabase, service.id)

  if (input.op === 'add') {
    const alt = cleanAlt(input.alt)
    if (!alt) return { error: 'Décrivez la photo (3 à 200 caractères) : le texte alternatif est obligatoire.' }
    if (images.length >= MAX_PHOTOS) return { error: `${MAX_PHOTOS} photos maximum.` }

    const m = PATH_RE.exec(input.path)
    if (!m || m[1].toLowerCase() !== service.provider_id.toLowerCase() || m[2].toLowerCase() !== service.id.toLowerCase()) {
      return { error: 'Chemin de fichier invalide.' }
    }
    // Le fichier doit réellement exister dans le seau.
    const folder = `${m[1]}/${m[2]}`
    const file = input.path.slice(folder.length + 1)
    const { data: found } = await supabase.storage.from(IMAGE_BUCKET).list(folder, { search: file, limit: 1 })
    if (!found?.some((f) => f.name === file)) return { error: 'Fichier introuvable : réessayez l’envoi.' }

    const url = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(input.path).data.publicUrl
    const { error } = await supabase.from('service_images').insert({
      service_id: service.id,
      url,
      alt_fr: alt,
      sort_order: images.length ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0,
      is_cover: images.length === 0,
    })
    if (error) return { error: error.message }
    return { ok: true }
  }

  const target = images.find((i) => i.id === input.imageId)
  if (!target) return { error: 'Photo introuvable.' }

  if (input.op === 'alt') {
    const alt = cleanAlt(input.alt)
    if (!alt) return { error: 'Texte alternatif : 3 à 200 caractères.' }
    const { error } = await supabase.from('service_images').update({ alt_fr: alt }).eq('id', target.id)
    return error ? { error: error.message } : { ok: true }
  }

  if (input.op === 'cover') {
    await supabase.from('service_images').update({ is_cover: false }).eq('service_id', service.id)
    const { error } = await supabase.from('service_images').update({ is_cover: true }).eq('id', target.id)
    return error ? { error: error.message } : { ok: true }
  }

  if (input.op === 'move') {
    const idx = images.findIndex((i) => i.id === target.id)
    const other = images[input.dir === 'up' ? idx - 1 : idx + 1]
    if (!other) return { ok: true }
    // Échange des positions puis renumérotation (les sort_order existants peuvent être égaux).
    const next = images.map((i) => i.id)
    const j = input.dir === 'up' ? idx - 1 : idx + 1
    ;[next[idx], next[j]] = [next[j], next[idx]]
    for (let pos = 0; pos < next.length; pos++) {
      const { error } = await supabase.from('service_images').update({ sort_order: pos }).eq('id', next[pos])
      if (error) return { error: error.message }
    }
    return { ok: true }
  }

  // delete
  const { error } = await supabase.from('service_images').delete().eq('id', target.id)
  if (error) return { error: error.message }
  const objectPath = objectPathFromUrl(target.url)
  if (objectPath) await supabase.storage.from(IMAGE_BUCKET).remove([objectPath])
  if (target.is_cover) {
    const rest = images.filter((i) => i.id !== target.id)
    if (rest[0]) await supabase.from('service_images').update({ is_cover: true }).eq('id', rest[0].id)
  }
  return { ok: true }
}
