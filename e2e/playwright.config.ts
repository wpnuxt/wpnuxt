import { defineConfig, devices } from '@playwright/test'

const nuxtFixture = process.env.NUXT_FIXTURE || 'nuxt43'
const testProject = process.env.TEST_PROJECT || 'all'
const nuxtPort = {
  nuxt3: 3003,
  nuxt40: 3040,
  nuxt41: 3041,
  nuxt42: 3042,
  nuxt43: 3043,
}[nuxtFixture] || 3043

const wpPort = process.env.WPNUXT_WORDPRESS_URL?.match(/:(\d+)/)?.[1] || 'local'
const blobSubDir = `blob-report/${testProject}-${nuxtFixture}-wp${wpPort}`

// Only start the Nuxt webServer when running nuxt tests
const needsWebServer = testProject !== 'wordpress'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['blob', { outputDir: blobSubDir }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'wordpress',
      testMatch: /wordpress\.spec\.ts/,
      use: {
        baseURL: process.env.WPNUXT_WORDPRESS_URL || 'http://localhost:8009',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'nuxt-3',
      testMatch: /nuxt\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:3003',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'nuxt-40',
      testMatch: /nuxt\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:3040',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'nuxt-41',
      testMatch: /nuxt\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:3041',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'nuxt-42',
      testMatch: /nuxt\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:3042',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'nuxt-43',
      testMatch: /nuxt\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:3043',
        ...devices['Desktop Chrome'],
      },
    },
  ],

  ...(needsWebServer ? {
    webServer: {
      command: `cd fixtures/${nuxtFixture} && pnpm run build && pnpm run test:serve`,
      url: `http://localhost:${nuxtPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
    },
  } : {}),
})
