import { defineNuxtPlugin, useCookie, useRuntimeConfig, useState } from '#imports'
import type { AuthState, WPUser } from '../types'

/**
 * Auth plugin that initializes authentication state on app load
 * Handles both password-based and OAuth authentication
 */
export default defineNuxtPlugin({
  name: 'wpnuxt-auth',
  enforce: 'pre',
  async setup() {
    const config = useRuntimeConfig().public.wpNuxtAuth
    const authState = useState<AuthState>('wpnuxt-auth', () => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null
    }))

    const authToken = useCookie(config.cookieName)

    // Check for user data cookies (set by OAuth callbacks)
    // - wpnuxt-user: Used by Headless Login providers (Google, GitHub, etc.)
    // - wpnuxt-oauth-user: Used by miniOrange OAuth
    const headlessLoginUserCookie = useCookie<string | null>('wpnuxt-user')
    const oauthUserCookie = useCookie<string | null>('wpnuxt-oauth-user')

    // Check if user has a token on initial load
    if (authToken.value) {
      authState.value.isAuthenticated = true

      // Try to hydrate user data from OAuth cookies (prefer Headless Login cookie)
      const userCookieValue = headlessLoginUserCookie.value || oauthUserCookie.value
      if (userCookieValue) {
        try {
          const userData = typeof userCookieValue === 'string'
            ? JSON.parse(userCookieValue)
            : userCookieValue
          authState.value.user = userData as WPUser
        } catch {
          // Invalid JSON in cookie, will be fetched later
        }
      }
      // The actual user data will be fetched by the component/page that needs it
      // (via useWPUser().fetchUser() for password auth or already hydrated for OAuth)
    }

    authState.value.isLoading = false
  }
})
