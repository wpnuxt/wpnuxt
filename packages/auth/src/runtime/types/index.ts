/**
 * WPNuxt Auth Types
 */

/**
 * Public runtime config for WPNuxt Auth
 */
export interface WPNuxtAuthPublicConfig {
  cookieName: string
  refreshCookieName: string
  tokenMaxAge: number
  refreshTokenMaxAge: number
  redirectOnLogin: string
  redirectOnLogout: string
  loginPage: string
}

// Extend Nuxt's public runtime config
declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    wpNuxtAuth: WPNuxtAuthPublicConfig
  }
}

export interface WPUser {
  id: string
  databaseId: number
  name: string
  email?: string
  firstName?: string
  lastName?: string
  username: string
  avatar?: {
    url: string
  }
  roles?: {
    nodes: Array<{
      name: string
    }>
  }
}

export interface AuthTokens {
  authToken: string
  refreshToken: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResult {
  success: boolean
  user?: WPUser
  tokens?: AuthTokens
  error?: string
}

export interface AuthState {
  user: WPUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface WPNuxtAuthConfig {
  /**
   * Enable the auth module
   * @default true
   */
  enabled?: boolean

  /**
   * Cookie name for storing the auth token
   * @default 'wpnuxt-auth-token'
   */
  cookieName?: string

  /**
   * Cookie name for storing the refresh token
   * @default 'wpnuxt-refresh-token'
   */
  refreshCookieName?: string

  /**
   * Token expiration time in seconds
   * @default 3600 (1 hour)
   */
  tokenMaxAge?: number

  /**
   * Refresh token expiration time in seconds
   * @default 604800 (7 days)
   */
  refreshTokenMaxAge?: number

  /**
   * Redirect path after login
   * @default '/'
   */
  redirectOnLogin?: string

  /**
   * Redirect path after logout
   * @default '/'
   */
  redirectOnLogout?: string

  /**
   * Login page path (for redirecting unauthenticated users)
   * @default '/login'
   */
  loginPage?: string
}
