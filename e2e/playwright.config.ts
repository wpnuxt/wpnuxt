import { defineConfig, devices } from '@playwright/test'

const nuxtFixture = process.env.NUXT_FIXTURE || 'nuxt47'
const nuxtPorts: Record<string, number> = {
  'nuxt44': 3045,
  'nuxt47': 3047,
  'nuxt-srcdir': 3044
}
const nuxtPort = nuxtPorts[nuxtFixture] || 3047

const wpPort = process.env.WPNUXT_WORDPRESS_URL?.match(/:(\d+)/)?.[1] || 'local'
const blobSubDir = `blob-report/${nuxtFixture}-wp${wpPort}`

const wordpressProject = {
  name: 'wordpress' as const,
  testMatch: /wordpress\.spec\.ts/,
  use: {
    baseURL: process.env.WPNUXT_WORDPRESS_URL || 'http://localhost:8009',
    ...devices['Desktop Chrome']
  }
}

const nuxtProject = {
  name: nuxtFixture as string,
  testMatch: /nuxt\.spec\.ts/,
  use: {
    baseURL: `http://localhost:${nuxtPort}`,
    ...devices['Desktop Chrome']
  }
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['blob', { outputDir: blobSubDir }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [wordpressProject, nuxtProject],

  ...(process.env.SKIP_WEB_SERVER
    ? {}
    : {
        webServer: {
          command: `cd fixtures/${nuxtFixture} && rm -rf .output .nuxt && npx nuxi build && pnpm run test:serve`,
          url: `http://localhost:${nuxtPort}`,
          reuseExistingServer: !process.env.CI,
          timeout: 180 * 1000
        }
      })
})
