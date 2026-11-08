'use client'

import { useActionState } from 'react'
import { saveCategoryAction } from '@/app/actions/admin'
import { Field, inputClass } from '@/components/provider/ui'
import { Button } from '@/components/ui/Button'
import type { ActionState } from '@/lib/provider/schemas'

export interface CategoryRow {
  id: string
  slug: string
  name_fr: string
  name_en: string
  name_es: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_active: boolean
}

export function CategoryForm({ category, submitLabel }: { category?: CategoryRow; submitLabel: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveCategoryAction, {})
  const err = state.fieldErrors ?? {}
  const k = category?.id ?? 'new'

  return (
    <form action={action} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Nom (FR)" htmlFor={`fr-${k}`} error={err.name_fr}>
          <input id={`fr-${k}`} name="name_fr" defaultValue={category?.name_fr} required maxLength={60} className={inputClass} />
        </Field>
        <Field label="Nom (EN)" htmlFor={`en-${k}`} error={err.name_en}>
          <input id={`en-${k}`} name="name_en" defaultValue={category?.name_en} required maxLength={60} className={inputClass} />
        </Field>
        <Field label="Nom (ES)" htmlFor={`es-${k}`} error={err.name_es}>
          <input id={`es-${k}`} name="name_es" defaultValue={category?.name_es ?? ''} required maxLength={60} className={inputClass} />
        </Field>
      </div>
      <div className="grid sm:grid-cols-4 gap-4 items-end">
        <Field label="Icône (emoji)" htmlFor={`icon-${k}`} error={err.icon}>
          <input id={`icon-${k}`} name="icon" defaultValue={category?.icon ?? ''} maxLength={8} className={inputClass} />
        </Field>
        <Field label="Couleur (#RRGGBB)" htmlFor={`color-${k}`} error={err.color}>
          <input id={`color-${k}`} name="color" defaultValue={category?.color ?? ''} placeholder="#2ABFB8" maxLength={7} className={inputClass} />
        </Field>
        <Field label="Ordre" htmlFor={`order-${k}`} error={err.sort_order}>
          <input id={`order-${k}`} name="sort_order" type="number" min={0} max={999} defaultValue={category?.sort_order ?? 0} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-xs text-charcoal pb-2.5">
          <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} className="h-4 w-4 accent-[var(--deep-green)]" />
          Visible sur le site
        </label>
      </div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.message && <p role="status" className="text-sm text-turquoise">{state.message}</p>}
      <Button type="submit" size="sm" loading={pending} className="rounded-full">
        {pending ? 'Enregistrement…' : submitLabel}
      </Button>
    </form>
  )
}
