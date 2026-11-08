'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { IMAGE_BUCKET, MAX_PHOTOS, MIN_PHOTOS, type ImageOp, type ServiceImage } from '@/lib/provider/images'
import type { ActionState } from '@/lib/provider/schemas'
import { inputClass } from './ui'
import { ConfirmButton } from '@/components/ui/ConfirmButton'

const MAX_SIDE = 1600
const MAX_INPUT_BYTES = 25 * 1024 * 1024

/** Réduit une photo à 1600 px maximum et la recompresse en JPEG avant l'envoi (un smartphone produit 3 à 8 Mo). */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponible')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Compression impossible'))), 'image/jpeg', 0.82),
  )
}

export function ServiceImagesManager({
  serviceId,
  providerId,
  images,
  act,
}: {
  serviceId: string
  providerId: string
  images: ServiceImage[]
  act: (op: ImageOp) => Promise<ActionState>
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [alt, setAlt] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null)
  const [pending, start] = useTransition()

  const disabled = busy || pending
  const remaining = MAX_PHOTOS - images.length

  function run(op: ImageOp) {
    setMessage(null)
    start(async () => {
      const res = await act(op)
      if (res.error) setMessage({ kind: 'error', text: res.error })
      else router.refresh()
    })
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setMessage(null)
    if (alt.trim().length < 3) {
      setMessage({ kind: 'error', text: 'Décrivez d’abord la photo (3 caractères minimum) : le texte alternatif est obligatoire.' })
      return
    }
    const chosen = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      setMessage({ kind: 'error', text: `${MAX_PHOTOS} photos maximum : seules les ${remaining} premières sont envoyées.` })
    }

    setBusy(true)
    const supabase = createClient()
    let added = 0
    for (const file of chosen) {
      if (!file.type.startsWith('image/') || file.size > MAX_INPUT_BYTES) {
        setMessage({ kind: 'error', text: `« ${file.name} » n’est pas une image acceptée (25 Mo maximum).` })
        continue
      }
      try {
        const blob = await compress(file)
        const path = `${providerId}/${serviceId}/${crypto.randomUUID()}.jpg`
        const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: false })
        if (error) throw new Error(error.message)
        const res = await act({ op: 'add', serviceId, path, alt })
        if (res.error) {
          await supabase.storage.from(IMAGE_BUCKET).remove([path])
          throw new Error(res.error)
        }
        added += 1
      } catch (e) {
        setMessage({ kind: 'error', text: e instanceof Error ? e.message : 'Envoi impossible.' })
        break
      }
    }
    setBusy(false)
    if (fileRef.current) fileRef.current.value = ''
    if (added > 0) {
      setAlt('')
      setMessage((m) => m ?? { kind: 'ok', text: `${added} photo${added > 1 ? 's' : ''} ajoutée${added > 1 ? 's' : ''}.` })
      router.refresh()
    }
  }

  return (
    <section aria-labelledby="photos-title" className="bg-coconut rounded-2xl border border-mist p-5 space-y-4">
      <div>
        <h2 id="photos-title" className="text-sm font-semibold text-deep-green">Photos</h2>
        <p className="text-[11px] text-stone mt-0.5">
          {images.length}/{MAX_PHOTOS} photos · {MIN_PHOTOS} minimum pour soumettre la fiche. La première (ou celle marquée « couverture ») sert d’image principale.
        </p>
      </div>

      {images.length > 0 && (
        <ul className="space-y-3">
          {images.map((img, i) => (
            <li key={img.id} className="flex flex-col sm:flex-row gap-3 rounded-xl border border-mist p-3">
              <div className="relative h-24 w-36 flex-none overflow-hidden rounded-lg bg-sand">
                <Image src={img.url} alt={img.alt_fr ?? ''} fill sizes="144px" className="object-cover" unoptimized />
                {img.is_cover && (
                  <span className="absolute left-1 top-1 rounded-full bg-deep-green px-2 py-0.5 text-[10px] font-medium text-coconut">Couverture</span>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <label className="block text-[11px] font-semibold text-charcoal" htmlFor={`alt-${img.id}`}>Description (texte alternatif)</label>
                <input
                  id={`alt-${img.id}`}
                  defaultValue={img.alt_fr ?? ''}
                  maxLength={200}
                  disabled={disabled}
                  onBlur={(e) => {
                    const v = e.target.value.trim()
                    if (v !== (img.alt_fr ?? '')) run({ op: 'alt', serviceId, imageId: img.id, alt: v })
                  }}
                  className={inputClass}
                />
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={disabled || i === 0} onClick={() => run({ op: 'move', serviceId, imageId: img.id, dir: 'up' })} aria-label="Monter" className="inline-flex items-center gap-1 text-xs border border-mist text-stone px-2.5 py-1.5 rounded-lg hover:bg-sand disabled:opacity-40">
                    <ArrowLeft size={12} /> Avant
                  </button>
                  <button type="button" disabled={disabled || i === images.length - 1} onClick={() => run({ op: 'move', serviceId, imageId: img.id, dir: 'down' })} aria-label="Descendre" className="inline-flex items-center gap-1 text-xs border border-mist text-stone px-2.5 py-1.5 rounded-lg hover:bg-sand disabled:opacity-40">
                    Après <ArrowRight size={12} />
                  </button>
                  {!img.is_cover && (
                    <button type="button" disabled={disabled} onClick={() => run({ op: 'cover', serviceId, imageId: img.id })} className="inline-flex items-center gap-1 text-xs border border-mist text-stone px-2.5 py-1.5 rounded-lg hover:bg-sand disabled:opacity-40">
                      <Star size={12} /> Couverture
                    </button>
                  )}
                  <ConfirmButton
                    label={<><Trash2 size={12} /> Supprimer</>}
                    ariaLabel="Supprimer cette photo"
                    message="Supprimer cette photo ? Cette action est définitive."
                    confirmLabel="Supprimer"
                    disabled={disabled}
                    onConfirm={() => run({ op: 'delete', serviceId, imageId: img.id })}
                    className="inline-flex items-center gap-1 text-xs border border-mist text-[#C0392B] px-2.5 py-1.5 rounded-lg hover:bg-sand disabled:opacity-40"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div className="space-y-3 rounded-xl bg-sand p-4">
          <div>
            <label htmlFor="new-alt" className="block text-xs font-semibold text-charcoal mb-1.5">
              Description des prochaines photos <span className="text-[#C0392B]">*</span>
            </label>
            <input
              id="new-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              maxLength={200}
              placeholder="Ex. : Table dressée en terrasse face à la mer"
              className={inputClass}
            />
          </div>
          <div>
            <input
              ref={fileRef}
              id="new-photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={disabled}
              onChange={(e) => void onFiles(e.target.files)}
              className="sr-only"
            />
            <label
              htmlFor="new-photos"
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-deep-green px-5 py-2.5 text-sm font-medium text-coconut hover:bg-deep-green/90 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <Upload size={15} /> {busy ? 'Envoi en cours…' : 'Choisir des photos'}
            </label>
            <p className="text-[11px] text-stone mt-2">JPEG, PNG ou WebP. Les photos sont réduites à 1600 px avant l’envoi.</p>
          </div>
        </div>
      )}

      {message && (
        <p role={message.kind === 'error' ? 'alert' : 'status'} className={`text-sm ${message.kind === 'error' ? 'text-[#C0392B]' : 'text-turquoise'}`}>
          {message.text}
        </p>
      )}
    </section>
  )
}
