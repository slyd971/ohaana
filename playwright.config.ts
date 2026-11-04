import { defineConfig, devices } from '@playwright/test'

const PORT = 3200

// Uses the locally installed Chrome (no browser download). In CI: `npx playwright install chromium`
// and set PW_CHANNEL= (empty) to use the bundled Chromium.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL ?? 'chrome' },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_DEMO_MODE: 'false' },
  },
})
