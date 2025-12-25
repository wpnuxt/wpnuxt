/**
 * Stub for nuxt/schema types
 * Used during module development when Nuxt types aren't available
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PublicRuntimeConfig {
  [key: string]: any
}

export interface RuntimeConfig {
  public: PublicRuntimeConfig
  [key: string]: any
}

export interface NuxtConfig {
  runtimeConfig?: RuntimeConfig
  [key: string]: any
}
