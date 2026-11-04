'use client'

import { useState, useTransition } from 'react'
import { generateSlotsAction, setDayBlockedAction } from '@/app/actions/provider'
import type { SlotDay } from '@/lib/provider/queries'
import type { ActionState } from '@/lib/provider/schemas'
import { inputClass } from './ui'

const WEEKDAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 0, label: 'Dim' },
]
const DEFAULT_TIMES = ['09:00', '14:00', '19:00']

function formatDay(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  )
}

export function AvailabilityEditor({ serviceId, days }: { serviceId: string; days: SlotDay[] }) {
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6])
  const [times, setTimes] = useState<string[]>(DEFAULT_TIMES)
  const [newTime, setNewTime] = useState('')
  const [horizon, setHorizon] = useState(60)
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionState | null>(null)

  const run = (fn: () => Promise<ActionState>) =>
    start(async () => {
      setResult(await fn())
    })

  const toggleDay = (v: number) => setWeekdays((cur) => (cur.includes(v) ? cur.filter((d) => d !== v) : [...cur, v]))
  const addTime = () => {
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(newTime) && !times.includes(newTime)) {
      setTimes((cur) => [...cur, newTime].sort())
      setNewTime('')
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-coconut rounded-2xl border border-mist p-5 space-y-4">
        <h2 className="text-sm font-semibold text-deep-green">Générer des créneaux</h2>
        <fieldset>
          <legend className="text-xs font-semibold text-charcoal mb-2">Jours de la semaine</legend>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                aria-pressed={weekdays.includes(d.value)}
                onClick={() => toggleDay(d.value)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  weekdays.includes(d.value) ? 'bg-deep-green text-coconut border-deep-green' : 'border-mist text-stone hover:bg-sand'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold text-charcoal mb-2">Heures de début</legend>
          <div className="flex flex-wrap items-center gap-2">
            {times.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 bg-sand rounded-full pl-3 pr-1.5 py-1 text-xs text-charcoal">
                {t}
                <button
                  type="button"
                  aria-label={`Retirer ${t}`}
                  onClick={() => setTimes((cur) => cur.filter((x) => x !== t))}
                  className="w-5 h-5 rounded-full hover:bg-mist text-stone"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              aria-label="Ajouter un horaire"
              className={`${inputClass} !w-auto !py-1.5`}
            />
            <button type="button" onClick={addTime} className="text-xs border border-mist text-stone px-3 py-1.5 rounded-lg hover:bg-sand">
              Ajouter
            </button>
          </div>
          <p className="text-[11px] text-stone mt-2">La durée de chaque créneau est celle de votre service.</p>
        </fieldset>

        <div className="flex flex-wrap items-end gap-4">
          <label className="text-xs font-semibold text-charcoal space-y-1.5">
            <span className="block">Sur les prochains…</span>
            <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className={`${inputClass} !w-auto`}>
              <option value={30}>30 jours</option>
              <option value={60}>60 jours</option>
              <option value={90}>90 jours</option>
              <option value={180}>180 jours</option>
            </select>
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => generateSlotsAction({ service_id: serviceId, weekdays, times, horizon_days: horizon }))}
            className="bg-deep-green text-coconut px-5 py-2.5 rounded-full text-sm font-medium hover:bg-deep-green/90 disabled:opacity-60 transition-colors"
          >
            {pending ? 'Génération…' : 'Générer les créneaux'}
          </button>
        </div>

        {result?.error && <p role="alert" className="text-sm text-[#C0392B]">{result.error}</p>}
        {result?.message && <p role="status" className="text-sm text-turquoise">{result.message}</p>}
      </section>

      <section className="bg-coconut rounded-2xl border border-mist overflow-hidden">
        <div className="px-5 py-4 border-b border-mist">
          <h2 className="text-sm font-semibold text-deep-green">Prochains jours</h2>
          <p className="text-[11px] text-stone mt-0.5">Bloquez un jour (congé, indisponibilité). Les créneaux déjà réservés ne sont pas affectés.</p>
        </div>
        {days.length === 0 ? (
          <p className="px-5 py-6 text-sm text-stone">Aucun créneau pour l’instant. Générez-en ci-dessus.</p>
        ) : (
          <ul className="divide-y divide-mist max-h-96 overflow-y-auto">
            {days.map((d) => {
              const allBlocked = d.free === 0
              return (
                <li key={d.date} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-charcoal capitalize">{formatDay(d.date)}</p>
                    <p className="text-[11px] text-stone">
                      {d.free} libre{d.free > 1 ? 's' : ''} sur {d.total}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setDayBlockedAction(serviceId, d.date, !allBlocked))}
                    className="text-xs border border-mist text-stone px-3 py-1.5 rounded-lg hover:bg-sand disabled:opacity-60"
                  >
                    {allBlocked ? 'Rouvrir le jour' : 'Bloquer le jour'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
