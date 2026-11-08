// Best-effort, per-instance throttle for public POST endpoints (serverless instances do not share memory).
const buckets = new Map<string, number[]>()

export function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

/** True when `key` made more than `max` calls in the last `windowMs`. */
export function rateLimited(key: string, max = 5, windowMs = 10 * 60_000) {
  const now = Date.now()
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  buckets.set(key, recent)
  if (buckets.size > 5000) buckets.clear()
  return recent.length > max
}
