import { defineConfig } from 'vite'

// Vanilla JS app. Vitest shares this config; tests run in a Node environment
// since the math/engine layers are pure and DOM-free.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
})
