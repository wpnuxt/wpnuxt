import { computed, useState, useCookie, useRuntimeConfig, navigateTo, useGraphqlMutation } from '#imports'
import type { AuthState, LoginCredentials, LoginResult, WPUser, AuthProvidersPublic, HeadlessLoginProvider } from '../types'

/**
 * Available authentication providers
 */
export interface AvailableProviders {
  password: boolean
  oauth: boolean
  headlessLogin: boolean
}

/**
 * Composable for WordPress authentication
 *
 * Supports:
 * - Password auth: Headless Login for WPGraphQL plugin
 * - OAuth2: miniOrange WP OAuth Server plugin (limited WPGraphQL compatibility)
 * - Headless Login: External OAuth providers (Google, GitHub, etc.) with full WPGraphQL support
 */
export function useWPAuth() {
  const config = useRuntimeConfig().public.wpNuxtAuth
  const authState = useState<AuthState>('wpnuxt-auth', () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }))

  const authToken = useCookie(config.cookieName, {
    maxAge: config.tokenMaxAge,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  const refreshTokenCookie = useCookie(config.refreshCookieName, {
    maxAge: config.refreshTokenMaxAge,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  // Cookie for storing user data (used to persist user info across page refreshes)
  const userDataCookie = useCookie<string | null>('wpnuxt-user', {
    maxAge: config.tokenMaxAge,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  /**
   * Login with username and password
   */
  async function login(credentials: LoginCredentials): Promise<LoginResult> {
    authState.value.isLoading = true
    authState.value.error = null

    try {
      // Use custom endpoint to bypass nuxt-graphql-middleware body parsing bug
      const response = await $fetch<{
        data?: {
          login: {
            authToken: string
            authTokenExpiration: string
            refreshToken: string
            refreshTokenExpiration: string
            user: WPUser
          }
        }
        errors?: Array<{ message: string }>
      }>('/api/auth/login', {
        method: 'POST',
        body: {
          username: credentials.username,
          password: credentials.password
        }
      })

      const data = response.data
      const errors = response.errors

      if (errors?.length) {
        const errorMessage = errors[0]?.message || 'Login failed'
        authState.value.error = errorMessage
        authState.value.isLoading = false
        return { success: false, error: errorMessage }
      }

      if (data?.login) {
        // Store tokens in cookies
        authToken.value = data.login.authToken
        refreshTokenCookie.value = data.login.refreshToken

        // Store user data in cookie for persistence across page refreshes
        userDataCookie.value = JSON.stringify(data.login.user)

        // Update state
        authState.value.user = data.login.user
        authState.value.isAuthenticated = true
        authState.value.isLoading = false

        return {
          success: true,
          user: data.login.user,
          tokens: {
            authToken: data.login.authToken,
            refreshToken: data.login.refreshToken
          }
        }
      }

      authState.value.isLoading = false
      return { success: false, error: 'Invalid response from server' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      authState.value.error = errorMessage
      authState.value.isLoading = false
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Logout and clear tokens
   */
  async function logout(): Promise<void> {
    // Call server endpoint to clear httpOnly cookies
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
      // Ignore errors - cookies might already be cleared
    })

    // Clear client-side state and cookies
    authToken.value = null
    refreshTokenCookie.value = null
    userDataCookie.value = null
    authState.value.user = null
    authState.value.isAuthenticated = false
    authState.value.error = null

    if (config.redirectOnLogout) {
      await navigateTo(config.redirectOnLogout)
    }
  }

  /**
   * Refresh the auth token using the refresh token
   */
  async function refresh(): Promise<boolean> {
    if (!refreshTokenCookie.value) {
      return false
    }

    try {
      const { data, errors } = await useGraphqlMutation('RefreshToken', {
        refreshToken: refreshTokenCookie.value
      })

      const refreshData = data as { refreshToken?: { authToken: string, success: boolean } } | null

      if (errors?.length || !refreshData?.refreshToken?.success) {
        await logout()
        return false
      }

      authToken.value = refreshData.refreshToken.authToken
      return true
    } catch {
      await logout()
      return false
    }
  }

  /**
   * Get the current auth token
   */
  function getToken(): string | null {
    return authToken.value || null
  }

  /**
   * Get available authentication providers
   */
  function getProviders(): AvailableProviders {
    const providers = config.providers as AuthProvidersPublic | undefined
    return {
      password: providers?.password?.enabled ?? true,
      oauth: providers?.oauth?.enabled ?? false,
      headlessLogin: providers?.headlessLogin?.enabled ?? false
    }
  }

  /**
   * Initiate OAuth2 login flow
   * Redirects the user to WordPress OAuth authorization page
   */
  async function loginWithOAuth(): Promise<void> {
    const providers = getProviders()
    if (!providers.oauth) {
      console.warn('[WPNuxt Auth] OAuth is not enabled')
      return
    }
    // Navigate to OAuth authorize endpoint (external redirect)
    await navigateTo('/api/auth/oauth/authorize', { external: true })
  }

  /**
   * Check if password login is available
   */
  function hasPasswordAuth(): boolean {
    return getProviders().password
  }

  /**
   * Check if OAuth login is available
   */
  function hasOAuthAuth(): boolean {
    return getProviders().oauth
  }

  /**
   * Check if Headless Login (external OAuth providers) is available
   */
  function hasHeadlessLoginAuth(): boolean {
    return getProviders().headlessLogin
  }

  /**
   * Fetch available Headless Login providers from WordPress
   * Returns providers configured in Headless Login for WPGraphQL plugin
   */
  async function fetchHeadlessLoginProviders(): Promise<HeadlessLoginProvider[]> {
    if (!hasHeadlessLoginAuth()) {
      return []
    }

    try {
      const runtimeConfig = useRuntimeConfig()
      const wordpressUrl = runtimeConfig.public.wordpressUrl as string | undefined
      const graphqlEndpoint = (runtimeConfig.public.wpNuxt as { graphqlEndpoint?: string } | undefined)?.graphqlEndpoint || '/graphql'

      if (!wordpressUrl) {
        console.warn('[WPNuxt Auth] WordPress URL not configured')
        return []
      }

      const response = await $fetch<{
        data?: {
          loginClients?: Array<{
            name: string
            provider: string
            authorizationUrl: string
            isEnabled: boolean
          }>
        }
        errors?: Array<{ message: string }>
      }>(`${wordpressUrl}${graphqlEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          query: `
            query LoginClients {
              loginClients {
                name
                provider
                authorizationUrl
                isEnabled
              }
            }
          `
        }
      })

      if (response.errors?.length) {
        console.warn('[WPNuxt Auth] Failed to fetch login clients:', response.errors[0]?.message)
        return []
      }

      // Filter for enabled OAuth providers (exclude PASSWORD and SITETOKEN)
      const clients = response.data?.loginClients || []
      return clients
        .filter(client =>
          client.isEnabled
          && client.provider !== 'PASSWORD'
          && client.provider !== 'SITETOKEN'
          && client.authorizationUrl
        )
        .map(client => ({
          name: client.name,
          provider: client.provider,
          authorizationUrl: client.authorizationUrl,
          isEnabled: client.isEnabled
        }))
    } catch (error) {
      console.warn('[WPNuxt Auth] Failed to fetch login providers:', error)
      return []
    }
  }

  /**
   * Initiate login with a Headless Login provider (Google, GitHub, etc.)
   * Redirects the user to the provider's OAuth page
   */
  async function loginWithProvider(provider: string): Promise<void> {
    if (!hasHeadlessLoginAuth()) {
      console.warn('[WPNuxt Auth] Headless Login is not enabled')
      return
    }
    // Navigate to provider authorize endpoint
    await navigateTo(`/api/auth/provider/${provider.toLowerCase()}/authorize`, { external: true })
  }

  return {
    // State
    state: authState,
    user: computed(() => authState.value.user),
    isAuthenticated: computed(() => authState.value.isAuthenticated),
    isLoading: computed(() => authState.value.isLoading),
    error: computed(() => authState.value.error),

    // Methods
    login,
    loginWithOAuth,
    loginWithProvider,
    logout,
    refresh,
    getToken,
    getProviders,
    hasPasswordAuth,
    hasOAuthAuth,
    hasHeadlessLoginAuth,
    fetchHeadlessLoginProviders
  }
}
