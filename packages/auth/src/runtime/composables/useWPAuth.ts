import { computed, useState, useCookie, useRuntimeConfig, navigateTo, useGraphqlMutation } from '#imports'
import type { AuthState, LoginCredentials, LoginResult, WPUser } from '../types'

/**
 * Composable for WordPress authentication
 *
 * Requires the following GraphQL mutations in your queries folder:
 * - Login: mutation Login($username: String!, $password: String!)
 * - RefreshAuthToken: mutation RefreshAuthToken($refreshToken: String!)
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

  const refreshToken = useCookie(config.refreshCookieName, {
    maxAge: config.refreshTokenMaxAge,
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
      const { data, errors } = await useGraphqlMutation<{
        login: {
          authToken: string
          refreshToken: string
          user: WPUser
        }
      }>('Login', {
        username: credentials.username,
        password: credentials.password
      })

      if (errors?.length) {
        const errorMessage = errors[0]?.message || 'Login failed'
        authState.value.error = errorMessage
        authState.value.isLoading = false
        return { success: false, error: errorMessage }
      }

      if (data?.login) {
        // Store tokens in cookies
        authToken.value = data.login.authToken
        refreshToken.value = data.login.refreshToken

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
    authToken.value = null
    refreshToken.value = null
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
    if (!refreshToken.value) {
      return false
    }

    try {
      const { data, errors } = await useGraphqlMutation<{
        refreshJwtAuthToken: {
          authToken: string
        }
      }>('RefreshAuthToken', {
        refreshToken: refreshToken.value
      })

      if (errors?.length || !data?.refreshJwtAuthToken) {
        await logout()
        return false
      }

      authToken.value = data.refreshJwtAuthToken.authToken
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

  return {
    // State
    state: authState,
    user: computed(() => authState.value.user),
    isAuthenticated: computed(() => authState.value.isAuthenticated),
    isLoading: computed(() => authState.value.isLoading),
    error: computed(() => authState.value.error),

    // Methods
    login,
    logout,
    refresh,
    getToken
  }
}
