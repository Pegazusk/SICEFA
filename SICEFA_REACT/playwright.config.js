import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'

const brave = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
export default defineConfig({
  testDir: './pruebas/navegador', fullyParallel: false, workers: 1,
  reporter: 'list', timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:5175', trace: 'retain-on-failure', screenshot: 'only-on-failure',
    launchOptions: { executablePath: process.env.BROWSER_PATH || (existsSync(brave) ? brave : undefined) },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: 'node scripts/servidor-de-pruebas.js', url: 'http://127.0.0.1:5175/api/estado', reuseExistingServer: false, timeout: 30000 },
})
