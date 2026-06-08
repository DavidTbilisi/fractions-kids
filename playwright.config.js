import { defineConfig, devices } from '@playwright/test'

// E2E tests live in e2e/ and drive the real Vite-served app in Chromium.
// Playwright starts the dev server on a fixed port so runs are deterministic
// (the default 5173 may already be taken by a dev session).
const PORT = 5191

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
