import { test, expect } from '@playwright/test'
import { GET } from '@/app/api/cron/daily/route'

// La route ne s'exécute jamais « ouverte » : sans CRON_SECRET, ou avec un mauvais jeton, elle répond 401 avant tout accès à la base.

const call = (auth?: string) => GET(new Request('http://localhost/api/cron/daily', { headers: auth ? { authorization: auth } : {} }))

test.describe('daily cron authorisation', () => {
  const previous = process.env.CRON_SECRET
  test.afterEach(() => {
    if (previous === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = previous
  })

  test('refuses everything when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET
    expect((await call('Bearer anything')).status).toBe(401)
    expect((await call()).status).toBe(401)
  })

  test('refuses a missing or wrong token', async () => {
    process.env.CRON_SECRET = 'correct-secret'
    expect((await call()).status).toBe(401)
    expect((await call('Bearer wrong-secret')).status).toBe(401)
    expect((await call('correct-secret')).status).toBe(401)
    expect((await call('Bearer correct-secre')).status).toBe(401)
  })
})
