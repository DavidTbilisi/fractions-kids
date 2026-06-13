import { defineConfig } from 'vite'

// Vanilla JS app. Vitest shares this config; tests run in a Node environment
// since the math/engine layers are pure and DOM-free.
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this repo at https://davidtbilisi.github.io/fractions-kids/,
  // so production assets must be referenced under that subpath. Dev server and
  // tests stay at root so the local flow and Playwright (port 5191) are unaffected.
  base: command === 'build' ? '/fractions-kids/' : '/',
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
}))
