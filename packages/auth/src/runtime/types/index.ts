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
  providers: AuthProvidersPublic
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
  nickname?: string
  description?: string
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

/**
 * Password authentication provider configuration
 */
export interface PasswordProviderConfig {
  /**
   * Enable password-based authentication
   * @default true
   */
  enabled?: boolean
}

/**
 * Headless Login provider from WordPress
 * Represents an OAuth provider configured in Headless Login for WPGraphQL
 */
export interface HeadlessLoginProvider {
  /** Provider name (e.g., 'google', 'github') */
  name: string
  /** Provider enum value (e.g., 'GOOGLE', 'GITHUB') */
  provider: string
  /** Full authorization URL with client_id and scopes */
  authorizationUrl: string
  /** Whether this provider is enabled in WordPress */
  isEnabled: boolean
}

/**
 * Headless Login OAuth configuration
 * Uses Headless Login for WPGraphQL plugin for external OAuth providers (Google, GitHub, etc.)
 * This gives full WPGraphQL compatibility - OAuth users get the same data as password users
 */
export interface HeadlessLoginConfig {
  /**
   * Enable Headless Login OAuth providers
   * Providers are auto-discovered from WordPress via loginClients query
   * @default false
   */
  enabled?: boolean
}

/**
 * OAuth2 authentication provider configuration
 * Requires miniOrange WP OAuth Server plugin on WordPress
 */
export interface OAuthProviderConfig {
  /**
   * Enable OAuth2 authentication
   * @default false
   */
  enabled?: boolean

  /**
   * OAuth2 client ID from WordPress OAuth server
   */
  clientId?: string

  /**
   * OAuth2 client secret (stored in private runtimeConfig, never exposed to client)
   */
  clientSecret?: string

  /**
   * Authorization endpoint path (relative to WordPress URL)
   * @default '/wp-json/moserver/authorize'
   */
  authorizationEndpoint?: string

  /**
   * Token endpoint path (relative to WordPress URL)
   * @default '/wp-json/moserver/token'
   */
  tokenEndpoint?: string

  /**
   * User info endpoint path (relative to WordPress URL)
   * @default '/wp-json/moserver/resource'
   */
  userInfoEndpoint?: string

  /**
   * OAuth2 scopes to request
   * @default ['openid', 'profile', 'email']
   */
  scopes?: string[]
}

/**
 * Authentication providers configuration
 */
export interface AuthProviders {
  /**
   * Password-based authentication (Headless Login for WPGraphQL)
   */
  password?: PasswordProviderConfig

  /**
   * OAuth2 authentication (miniOrange WP OAuth Server)
   * Note: miniOrange tokens are NOT compatible with WPGraphQL
   */
  oauth?: OAuthProviderConfig

  /**
   * Headless Login OAuth providers (Google, GitHub, etc.)
   * Uses Headless Login for WPGraphQL plugin - full WPGraphQL compatibility
   */
  headlessLogin?: HeadlessLoginConfig
}

/**
 * Public OAuth config (without secrets)
 */
export interface OAuthPublicConfig {
  enabled: boolean
  clientId: string
  authorizationEndpoint: string
  scopes: string[]
}

/**
 * Public Headless Login config
 */
export interface HeadlessLoginPublicConfig {
  enabled: boolean
}

/**
 * Public providers config (without secrets)
 */
export interface AuthProvidersPublic {
  password: { enabled: boolean }
  oauth: OAuthPublicConfig
  headlessLogin: HeadlessLoginPublicConfig
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

  /**
   * Authentication providers configuration
   */
  providers?: AuthProviders
}
