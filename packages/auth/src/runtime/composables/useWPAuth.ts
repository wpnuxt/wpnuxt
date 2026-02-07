import { computed, useState, useCookie, useRuntimeConfig, navigateTo, useGraphqlMutation } from '#imports'
import type { AuthState, LoginCredentials, LoginResult, WPUser, AuthProvidersPublic, HeadlessLoginProvider, LoginClientsResponse } from '../types'
import { logger } from '../utils/logger'

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
   *
   * Uses useGraphqlMutation to call the Login mutation through nuxt-graphql-middleware.
   */
  async function login(credentials: LoginCredentials): Promise<LoginResult> {
    authState.value.isLoading = true
    authState.value.error = null

    try {
      const { data, errors } = await useGraphqlMutation('Login', {
        username: credentials.username,
        password: credentials.password
      })

      if (errors?.length) {
        const errorMessage = errors[0]?.message || 'Login failed'
        authState.value.error = errorMessage
        authState.value.isLoading = false
        return { success: false, error: errorMessage }
      }

      // Type assertion for the login response
      const loginData = data as {
        login?: {
          authToken: string
          authTokenExpiration: string
          refreshToken: string
          refreshTokenExpiration: string
          user: WPUser
        }
      } | null

      if (loginData?.login) {
        // Store tokens in cookies
        authToken.value = loginData.login.authToken
        refreshTokenCookie.value = loginData.login.refreshToken

        // Store user data in cookie for persistence across page refreshes
        userDataCookie.value = JSON.stringify(loginData.login.user)

        // Update state
        authState.value.user = loginData.login.user
        authState.value.isAuthenticated = true
        authState.value.isLoading = false

        return {
          success: true,
          user: loginData.login.user,
          tokens: {
            authToken: loginData.login.authToken,
            refreshToken: loginData.login.refreshToken
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
   *
   * Uses $fetch directly for the server call because logout is a mutation
   */
  async function logout(): Promise<void> {
    // Call server endpoint to clear httpOnly cookies
    await $fetch('/api/_wpnuxt-auth/logout', { method: 'POST' }).catch(() => {
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
   * Result of a token refresh operation
   */
  interface RefreshResult {
    success: boolean
    error?: string
  }

  /**
   * Refresh the auth token using the refresh token.
   *
   * On failure, clears all auth state and tokens (graceful degradation).
   * Returns a result object with success status and optional error message.
   */
  async function refresh(): Promise<RefreshResult> {
    if (!refreshTokenCookie.value) {
      return { success: false, error: 'No refresh token available' }
    }

    try {
      const { data, errors } = await useGraphqlMutation('RefreshToken', {
        refreshToken: refreshTokenCookie.value
      })

      // Handle GraphQL errors
      if (errors?.length) {
        const errorMessage = errors[0]?.message || 'Token refresh failed'

        // Clear all auth state on refresh failure (graceful degradation)
        authToken.value = null
        refreshTokenCookie.value = null
        userDataCookie.value = null
        authState.value.isAuthenticated = false
        authState.value.user = null
        authState.value.error = errorMessage

        return { success: false, error: errorMessage }
      }

      const refreshData = data as { refreshToken?: { authToken: string, success: boolean } } | null

      // Handle unsuccessful refresh response
      if (!refreshData?.refreshToken?.success) {
        const errorMessage = 'Token refresh was not successful'

        // Clear all auth state
        authToken.value = null
        refreshTokenCookie.value = null
        userDataCookie.value = null
        authState.value.isAuthenticated = false
        authState.value.user = null
        authState.value.error = errorMessage

        return { success: false, error: errorMessage }
      }

      // Success - update token
      authToken.value = refreshData.refreshToken.authToken
      authState.value.error = null

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Token refresh failed unexpectedly'

      // Clear all auth state on error (graceful degradation)
      authToken.value = null
      refreshTokenCookie.value = null
      userDataCookie.value = null
      authState.value.isAuthenticated = false
      authState.value.user = null
      authState.value.error = errorMessage

      return { success: false, error: errorMessage }
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
      logger.warn('OAuth is not enabled')
      return
    }
    // Navigate to OAuth authorize endpoint (external redirect)
    await navigateTo('/api/_wpnuxt-auth/oauth/authorize', { external: true })
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
        logger.warn('WordPress URL not configured')
        return []
      }

      const response = await $fetch(`${wordpressUrl}${graphqlEndpoint}`, {
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
      }) as LoginClientsResponse

      if (response.errors?.length) {
        logger.warn('Failed to fetch login clients:', response.errors[0]?.message)
        return []
      }

      // Filter for enabled OAuth providers (exclude PASSWORD and SITETOKEN)
      const clients = response.data?.loginClients || []
      return clients
        .filter((client: HeadlessLoginProvider) =>
          client.isEnabled
          && client.provider !== 'PASSWORD'
          && client.provider !== 'SITETOKEN'
          && client.authorizationUrl
        )
        .map((client: HeadlessLoginProvider) => ({
          name: client.name,
          provider: client.provider,
          authorizationUrl: client.authorizationUrl,
          isEnabled: client.isEnabled
        }))
    } catch (error) {
      logger.warn('Failed to fetch login providers:', error)
      return []
    }
  }

  /**
   * Initiate login with a Headless Login provider (Google, GitHub, etc.)
   * Redirects the user to the provider's OAuth page
   */
  async function loginWithProvider(provider: string): Promise<void> {
    if (!hasHeadlessLoginAuth()) {
      logger.warn('Headless Login is not enabled')
      return
    }
    // Navigate to provider authorize endpoint
    await navigateTo(`/api/_wpnuxt-auth/provider/${provider.toLowerCase()}/authorize`, { external: true })
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
