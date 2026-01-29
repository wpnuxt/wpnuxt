/**
 * Type stubs for Nuxt-generated imports.
 * These are used during module development when .nuxt folder doesn't exist.
 * Actual types are generated at runtime in consuming applications.
 */

import type { ComputedRef, Ref } from 'vue'
import type { NuxtApp } from 'nuxt/app'

// Navigation options
interface NavigateToOptions {
  replace?: boolean
  redirectCode?: number
  external?: boolean
}

// Cookie options
interface CookieOptions {
  maxAge?: number
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

// OAuth public config (without secrets)
interface OAuthPublicConfig {
  enabled: boolean
  clientId: string
  authorizationEndpoint: string
  scopes: string[]
}

// Headless Login public config
interface HeadlessLoginPublicConfig {
  enabled: boolean
}

// Public providers config (without secrets)
interface AuthProvidersPublic {
  password: { enabled: boolean }
  oauth: OAuthPublicConfig
  headlessLogin: HeadlessLoginPublicConfig
}

// WPNuxt Auth public config interface
interface WPNuxtAuthPublicConfig {
  cookieName: string
  refreshCookieName: string
  tokenMaxAge: number
  refreshTokenMaxAge: number
  redirectOnLogin: string
  redirectOnLogout: string
  loginPage: string
  providers: AuthProvidersPublic
}

// Runtime config interface
interface RuntimeConfig {
  public: {
    wpNuxtAuth: WPNuxtAuthPublicConfig
    wordpressUrl?: string
    [key: string]: unknown
  }
  wpNuxtAuth?: WPNuxtAuthPublicConfig
  [key: string]: unknown
}

// Nuxt plugin with name
interface NuxtPluginConfig {
  name?: string
  enforce?: 'pre' | 'post'
  setup?: (nuxtApp: NuxtApp) => void | Promise<void>
}

// Stub for #imports - Vue reactivity
export function computed<T>(getter: () => T): ComputedRef<T>

// Stub for #imports - Nuxt
export function defineNuxtPlugin(plugin: NuxtPluginConfig | ((nuxtApp: NuxtApp) => void | Promise<void>)): unknown
export function navigateTo(to: string | { path: string }, options?: NavigateToOptions): Promise<void>
export function useCookie<T = string>(name: string, options?: CookieOptions): Ref<T | null>
export function useRuntimeConfig(): RuntimeConfig
export function useState<T = unknown>(key: string, init?: () => T): Ref<T>

// Stub for #imports - nuxt-graphql-middleware
export function useGraphqlMutation<T = unknown>(
  name: string,
  variables?: Record<string, unknown>,
  options?: Record<string, unknown>
): Promise<{ data: T | null, error: Error | null }>

export function useGraphqlQuery<T = unknown>(
  name: string,
  params?: Record<string, unknown>,
  options?: Record<string, unknown>
): { data: Ref<T | null>, pending: Ref<boolean>, error: Ref<Error | null> }
