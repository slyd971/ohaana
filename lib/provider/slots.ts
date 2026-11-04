import { availabilitySchema } from './schemas'

export interface SlotRow {
  service_id: string
  date: string
  start_time: string
  end_time: string
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() + n)
  return d
}

function plusMinutes(time: string, minutes: number): string | null {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  if (total >= 24 * 60) return null
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
}

export type SlotPlan = { ok: false; error: string } | { ok: true; rows: SlotRow[] }

/** Calcule les créneaux d'un modèle hebdomadaire (jours + heures de début) pour un service de durée donnée. */
export function planSlots(
  input: { service_id: string; weekdays: number[]; times: string[]; horizon_days: number },
  durationMin: number | null,
  today: Date,
): SlotPlan {
  const parsed = availabilitySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Paramètres invalides.' }
  const v = parsed.data
  const duration = durationMin ?? 60

  const start = new Date(today)
  start.setUTCHours(0, 0, 0, 0)
  const rows: SlotRow[] = []
  for (let i = 1; i <= v.horizon_days; i++) {
    const day = addDays(start, i)
    if (!v.weekdays.includes(day.getUTCDay())) continue
    for (const t of v.times) {
      const end = plusMinutes(t, duration)
      if (!end) continue // la prestation déborderait sur le lendemain
      rows.push({ service_id: v.service_id, date: day.toISOString().slice(0, 10), start_time: `${t}:00`, end_time: end })
    }
  }
  if (rows.length === 0) return { ok: false, error: 'Aucun créneau à créer avec ces réglages.' }
  return { ok: true, rows }
}
