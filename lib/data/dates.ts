const isoDay = (d: Date) => d.toISOString().slice(0, 10)

/** [today, today + days] as YYYY-MM-DD, for availability windows. */
export function availabilityWindow(days = 90): { from: string; to: string } {
  const now = Date.now()
  return { from: isoDay(new Date(now)), to: isoDay(new Date(now + days * 86_400_000)) }
}
