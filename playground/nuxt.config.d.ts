import type { WPNuxtConfig } from '../src/types'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    wpNuxt?: WPNuxtConfig
    eslint?: {
      config?: {
        stylistic?: {
          commaDangle?: string
          braceStyle?: string
        }
      }
      checker?: {
        lintOnStart?: boolean
        fix?: boolean
      }
    }
  }
}

export {}
