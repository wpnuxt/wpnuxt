import type { WPNuxtConfig } from '../../../src/types'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    wpNuxt?: WPNuxtConfig
  }
}

export {}
