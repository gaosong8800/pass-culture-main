import { defineConfig } from 'cypress'

// ts-unused-exports:disable-next-line
export default defineConfig({
  e2e: {
    setupNodeEvents() {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3001',
    experimentalRunAllSpecs: true, // Run all specs test in UI mode
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
  defaultCommandTimeout: 30000,
  requestTimeout: 30000,
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: true,
  videoCompression: true,
})
