import { defineConfig, devices } from '@playwright/test'

const PORT = 3200

// Local secrets for the credentialed specs live in .env.e2e (git-ignored, see .env.e2e.example).
try {
  process.loadEnvFile('.env.e2e')
} catch {
  // no .env.e2e: the credentialed specs are skipped
}

// Reuse an already running app (e.g. your `npm run dev` on :3000) instead of starting one on :3200:
//   PW_BASE_URL=http://localhost:3000 npm run test:e2e
// Needed when another `next dev` already runs in this folder (Next allows a single dev server per folder).
const EXTERNAL_URL = process.env.PW_BASE_URL

// Uses the locally installed Chrome (no browser download). In CI: `npx playwright install chromium`
// and set PW_CHANNEL= (empty) to use the bundled Chromium.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: EXTERNAL_URL ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL ?? 'chrome' },
    },
  ],
  webServer: EXTERNAL_URL
    ? undefined
    : {
        command: `npx next dev -p ${PORT}`,
        url: `http://localhost:${PORT}/login`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: { NEXT_PUBLIC_DEMO_MODE: 'false' },
      },
})
