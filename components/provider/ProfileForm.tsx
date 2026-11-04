'use client'

import { useActionState } from 'react'
import { saveProfileAction } from '@/app/actions/provider'
import { Field, inputClass } from './ui'
import { ISLAND_LABELS, PROVIDER_ISLANDS, type ActionState } from '@/lib/provider/schemas'
import type { ProviderRow } from '@/lib/provider/context'

type ProfileValues = Pick<ProviderRow, 'business_name' | 'bio' | 'languages' | 'island' | 'phone' | 'whatsapp'>

const EMPTY_PROFILE: ProfileValues = { business_name: '', bio: '', languages: ['fr'], island: 'guadeloupe', phone: '', whatsapp: '' }

export function ProfileForm({
  provider = EMPTY_PROFILE,
  action: formAction = saveProfileAction,
  hidden,
  submitLabel = 'Enregistrer',
}: {
  provider?: ProfileValues
  action?: (prev: ActionState, formData: FormData) => Promise<ActionState>
  /** Extra hidden fields (e.g. provider_id, locale) used by the admin space. */
  hidden?: Record<string, string>
  submitLabel?: string
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(formAction, {})
  const err = state.fieldErrors ?? {}

  return (
    <form action={action} className="bg-coconut rounded-2xl border border-mist p-5 space-y-4">
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <Field label="Nom commercial" htmlFor="business_name" error={err.business_name}>
        <input id="business_name" name="business_name" defaultValue={provider.business_name} required maxLength={100} className={inputClass} />
      </Field>
      <Field label="Présentation" htmlFor="bio" error={err.bio} hint="Affichée sur vos fiches publiques.">
        <textarea id="bio" name="bio" defaultValue={provider.bio ?? ''} rows={5} maxLength={2000} className={inputClass} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Île principale" htmlFor="island" error={err.island}>
          <select id="island" name="island" defaultValue={provider.island} className={inputClass}>
            {PROVIDER_ISLANDS.map((i) => (
              <option key={i} value={i}>{ISLAND_LABELS[i]}</option>
            ))}
          </select>
        </Field>
        <Field label="Langues parlées" htmlFor="languages" error={err.languages} hint="Codes séparés par des virgules : fr, en, es">
          <input id="languages" name="languages" defaultValue={provider.languages.join(', ')} className={inputClass} />
        </Field>
        <Field label="Téléphone" htmlFor="phone" error={err.phone} hint="Jamais public : transmis au voyageur après une réservation confirmée.">
          <input id="phone" name="phone" type="tel" defaultValue={provider.phone ?? ''} className={inputClass} />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp" error={err.whatsapp}>
          <input id="whatsapp" name="whatsapp" type="tel" defaultValue={provider.whatsapp ?? ''} className={inputClass} />
        </Field>
      </div>

      {state.error && <p role="alert" className="text-sm text-[#C0392B]">{state.error}</p>}
      {state.message && <p role="status" className="text-sm text-turquoise">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-deep-green text-coconut px-6 py-2.5 rounded-full text-sm font-medium hover:bg-deep-green/90 disabled:opacity-60 transition-colors"
      >
        {pending ? 'Enregistrement…' : submitLabel}
      </button>
    </form>
  )
}
