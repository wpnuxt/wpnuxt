/**
 * Stub for nuxt/schema types
 * Used during module development when Nuxt types aren't available
 */

export interface PublicRuntimeConfig {
  [key: string]: unknown
}

export interface RuntimeConfig {
  public: PublicRuntimeConfig
  [key: string]: unknown
}

export interface NuxtConfig {
  runtimeConfig?: RuntimeConfig
  [key: string]: unknown
}
