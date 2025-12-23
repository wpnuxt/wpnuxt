import { defineNuxtPlugin, useCookie, useRuntimeConfig, useState } from '#imports'
import type { AuthState } from '../types'

/**
 * Auth plugin that initializes authentication state on app load
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

    // Check if user has a token on initial load
    if (authToken.value) {
      authState.value.isAuthenticated = true
      // The actual user data will be fetched by the component/page that needs it
    }

    authState.value.isLoading = false
  }
})
