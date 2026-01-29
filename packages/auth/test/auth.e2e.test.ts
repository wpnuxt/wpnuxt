import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

/**
 * Auth E2E Tests
 *
 * NOTE: These tests are currently skipped due to a bundling issue with nuxt-graphql-middleware.
 * The auth module triggers a babel transformation in graphqlMiddleware that fails in the test
 * environment with "Cannot find module '../dist/babel.cjs'".
 *
 * This is likely due to how nitro bundles the graphqlMiddleware code for SSR.
 * The unit tests in schemaDetection.test.ts cover the core auth functionality.
 *
 * TODO: Investigate the bundling issue and re-enable E2E tests.
 * Possible solutions:
 * - Configure nitro externals to properly handle babel dependencies
 * - Use a different test setup that doesn't trigger the transformation
 * - Update nuxt-graphql-middleware configuration
 */
describe.skip('auth e2e', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/auth', import.meta.url))
  })

  describe('home page (unauthenticated)', () => {
    it('renders the home page', async () => {
      const html = await $fetch('/')
      expect(html).toContain('Auth Test Home')
      expect(html).toContain('id="auth-status"')
    })

    it('shows unauthenticated state by default', async () => {
      const html = await $fetch('/')
      expect(html).toContain('id="unauthenticated"')
      expect(html).toContain('Not Authenticated')
    })

    it('shows login link when not authenticated', async () => {
      const html = await $fetch('/')
      expect(html).toContain('id="login-link"')
      expect(html).toContain('href="/login"')
    })

    it('does not show user info when not authenticated', async () => {
      const html = await $fetch('/')
      expect(html).not.toContain('id="user-info"')
    })

    it('does not show logout button when not authenticated', async () => {
      const html = await $fetch('/')
      expect(html).not.toContain('id="logout-btn"')
    })
  })

  describe('login page', () => {
    it('renders the login page', async () => {
      const html = await $fetch('/login')
      expect(html).toContain('Login Page')
      expect(html).toContain('id="login-form"')
    })

    it('renders username input', async () => {
      const html = await $fetch('/login')
      expect(html).toContain('id="username"')
      expect(html).toContain('type="text"')
      expect(html).toContain('name="username"')
    })

    it('renders password input', async () => {
      const html = await $fetch('/login')
      expect(html).toContain('id="password"')
      expect(html).toContain('type="password"')
      expect(html).toContain('name="password"')
    })

    it('renders submit button', async () => {
      const html = await $fetch('/login')
      expect(html).toContain('id="submit-btn"')
      expect(html).toContain('type="submit"')
    })

    it('submit button shows "Login" text initially', async () => {
      const html = await $fetch('/login')
      expect(html).toContain('>Login</button>')
    })

    it('form fields are required', async () => {
      const html = await $fetch('/login')
      // Check for required attribute on inputs
      expect(html).toMatch(/id="username"[^>]*required/)
      expect(html).toMatch(/id="password"[^>]*required/)
    })
  })

  describe('protected page (unauthenticated)', () => {
    it('renders the protected page', async () => {
      const html = await $fetch('/protected')
      expect(html).toContain('Protected Page')
      expect(html).toContain('id="auth-check"')
    })

    it('shows access denied when not authenticated', async () => {
      const html = await $fetch('/protected')
      expect(html).toContain('id="access-denied"')
      expect(html).toContain('Access Denied')
    })

    it('does not show access granted when not authenticated', async () => {
      const html = await $fetch('/protected')
      expect(html).not.toContain('id="access-granted"')
    })

    it('does not show user details when not authenticated', async () => {
      const html = await $fetch('/protected')
      expect(html).not.toContain('id="user-details"')
    })
  })

  describe('user profile page (unauthenticated)', () => {
    it('renders the user profile page', async () => {
      const html = await $fetch('/user-profile')
      expect(html).toContain('User Profile')
      expect(html).toContain('id="fetch-status"')
    })

    it('shows no user data initially', async () => {
      const html = await $fetch('/user-profile')
      expect(html).toContain('id="fetch-error"')
      expect(html).toContain('No user data')
    })

    it('renders fetch user button', async () => {
      const html = await $fetch('/user-profile')
      expect(html).toContain('id="fetch-btn"')
      expect(html).toContain('Fetch User')
    })

    it('renders clear user button', async () => {
      const html = await $fetch('/user-profile')
      expect(html).toContain('id="clear-btn"')
      expect(html).toContain('Clear User')
    })

    it('does not show profile data when not authenticated', async () => {
      const html = await $fetch('/user-profile')
      expect(html).not.toContain('id="profile-data"')
    })

    it('shows role check section', async () => {
      const html = await $fetch('/user-profile')
      expect(html).toContain('id="role-check"')
      expect(html).toContain('id="is-admin"')
      expect(html).toContain('id="display-name"')
    })

    it('shows not admin when not authenticated', async () => {
      const html = await $fetch('/user-profile')
      expect(html).toContain('Not Admin')
    })
  })

  describe('navigation', () => {
    it('login link navigates to login page', async () => {
      const html = await $fetch('/')
      expect(html).toContain('href="/login"')
    })

    it('all pages render without errors', async () => {
      // Test that all pages can be fetched without 500 errors
      const pages = ['/', '/login', '/protected', '/user-profile']

      for (const page of pages) {
        const html = await $fetch(page)
        expect(html).toContain('<!DOCTYPE html>')
        expect(html).not.toContain('500')
      }
    })
  })

  describe('SSR hydration', () => {
    it('includes Nuxt data for hydration on home page', async () => {
      const html = await $fetch('/')
      expect(html).toContain('__NUXT_DATA__')
    })

    it('includes Nuxt data for hydration on login page', async () => {
      const html = await $fetch('/login')
      expect(html).toContain('__NUXT_DATA__')
    })

    it('includes auth config in runtime config', async () => {
      const html = await $fetch('/')
      // Check that wpNuxtAuth config is exposed
      expect(html).toContain('wpNuxtAuth')
    })
  })
})
