'use client'

import { useActionState } from 'react'
import { saveServiceAction } from '@/app/actions/provider'
import { Field, inputClass } from './ui'
import { ISLAND_LABELS, PROVIDER_ISLANDS, type ActionState } from '@/lib/provider/schemas'
import type { ProviderService } from '@/lib/provider/queries'

interface CategoryOption {
  id: string
  name_fr: string
}

export function ServiceForm({
  locale,
  categories,
  service,
  defaultIsland,
}: {
  locale: string
  categories: CategoryOption[]
  service?: ProviderService
  defaultIsland: string
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveServiceAction, {})
  const err = state.fieldErrors ?? {}
  const editingPublished = service?.status === 'published'

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {service && <input type="hidden" name="id" value={service.id} />}

      {service?.status === 'rejected' && service.rejection_reason && (
        <div role="alert" className="rounded-xl bg-coral/10 text-coral text-xs px-4 py-3">
          <strong>Fiche refusée :</strong> {service.rejection_reason}
        </div>
      )}
      {editingPublished && (
        <div className="rounded-xl bg-[#F5A623]/10 text-[#8A5A00] text-xs px-4 py-3">
          Cette fiche est publiée. Toute modification la repasse en relecture avant de réapparaître sur le site.
        </div>
      )}

      <section className="bg-coconut rounded-2xl border border-mist p-5 space-y-4">
        <h2 className="text-sm font-semibold text-deep-green">Présentation</h2>
        <Field label="Titre (français)" htmlFor="title_fr" error={err.title_fr} hint="Ex. : Dîner de chef à domicile — Menu créole">
          <input id="title_fr" name="title_fr" defaultValue={service?.title_fr} required maxLength={120} className={inputClass} />
        </Field>
        <Field label="Description (français)" htmlFor="description_fr" error={err.description_fr} hint="Ce qui est inclus, le déroulé, ce que le client doit prévoir.">
          <textarea id="description_fr" name="description_fr" defaultValue={service?.description_fr ?? ''} required rows={6} maxLength={4000} className={inputClass} />
        </Field>
        <details className="rounded-xl border border-mist px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold text-stone">Version anglaise (facultatif)</summary>
          <div className="space-y-4 pt-3">
            <Field label="Title (English)" htmlFor="title_en" error={err.title_en}>
              <input id="title_en" name="title_en" defaultValue={service?.title_en ?? ''} maxLength={120} className={inputClass} />
            </Field>
            <Field label="Description (English)" htmlFor="description_en" error={err.description_en}>
              <textarea id="description_en" name="description_en" defaultValue={service?.description_en ?? ''} rows={5} maxLength={4000} className={inputClass} />
            </Field>
          </div>
        </details>
      </section>

      <section className="bg-coconut rounded-2xl border border-mist p-5 space-y-4">
        <h2 className="text-sm font-semibold text-deep-green">Catégorie et lieu</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Catégorie" htmlFor="category_id" error={err.category_id}>
            <select id="category_id" name="category_id" defaultValue={service?.category_id ?? ''} required className={inputClass}>
              <option value="" disabled>Choisir…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_fr}</option>
              ))}
            </select>
          </Field>
          <Field label="Île" htmlFor="island" error={err.island}>
            <select id="island" name="island" defaultValue={service?.island ?? defaultIsland} required className={inputClass}>
              {PROVIDER_ISLANDS.map((i) => (
                <option key={i} value={i}>{ISLAND_LABELS[i]}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Adresse ou zone de déplacement" htmlFor="address" error={err.address} hint="Ex. : Gosier et environs, ou adresse de l’atelier.">
          <input id="address" name="address" defaultValue={service?.address ?? ''} maxLength={200} className={inputClass} />
        </Field>
        <Field label="Mots-clés" htmlFor="tags" error={err.tags} hint="Séparés par des virgules (10 maximum).">
          <input id="tags" name="tags" defaultValue={service?.tags?.join(', ') ?? ''} className={inputClass} />
        </Field>
      </section>

      <section className="bg-coconut rounded-2xl border border-mist p-5 space-y-4">
        <h2 className="text-sm font-semibold text-deep-green">Tarif et capacité</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Prix (€)" htmlFor="price_euros" error={err.price_euros}>
            <input id="price_euros" name="price_euros" type="number" inputMode="decimal" min={1} step="0.5" defaultValue={service ? service.price_cents / 100 : ''} required className={inputClass} />
          </Field>
          <Field label="Le prix s’applique…" htmlFor="price_unit" error={err.price_unit}>
            <select id="price_unit" name="price_unit" defaultValue={service?.price_unit ?? 'per_person'} className={inputClass}>
              <option value="per_person">par personne</option>
              <option value="flat">pour l’ensemble du groupe</option>
            </select>
          </Field>
          <Field label="Durée (minutes)" htmlFor="duration_min" error={err.duration_min}>
            <input id="duration_min" name="duration_min" type="number" inputMode="numeric" min={15} max={1439} defaultValue={service?.duration_min ?? 120} required className={inputClass} />
          </Field>
          <Field label="Délai de prévenance (heures)" htmlFor="min_notice_hours" error={err.min_notice_hours} hint="Délai minimum entre la réservation et la prestation.">
            <input id="min_notice_hours" name="min_notice_hours" type="number" inputMode="numeric" min={0} max={720} defaultValue={service?.min_notice_hours ?? 24} className={inputClass} />
          </Field>
          <Field label="Participants minimum" htmlFor="capacity_min" error={err.capacity_min}>
            <input id="capacity_min" name="capacity_min" type="number" inputMode="numeric" min={1} defaultValue={service?.capacity_min ?? 1} required className={inputClass} />
          </Field>
          <Field label="Participants maximum" htmlFor="capacity_max" error={err.capacity_max}>
            <input id="capacity_max" name="capacity_max" type="number" inputMode="numeric" min={1} defaultValue={service?.capacity_max ?? 4} required className={inputClass} />
          </Field>
        </div>
        <p className="text-[11px] text-stone">
          Des frais de service de 20 % sont ajoutés au prix affiché au voyageur. Vous recevez le prix que vous fixez ici.
        </p>
      </section>

      {state.error && (
        <p role="alert" className="text-sm text-[#C0392B]">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-deep-green text-coconut px-6 py-2.5 rounded-full text-sm font-medium hover:bg-deep-green/90 disabled:opacity-60 transition-colors"
        >
          {pending ? 'Enregistrement…' : service ? 'Enregistrer' : 'Créer le brouillon'}
        </button>
      </div>
    </form>
  )
}
