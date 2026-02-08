import type { WPNuxtConfig } from './config'

declare module 'nuxt/schema' {
  interface NuxtConfig {
    wpNuxt?: Partial<WPNuxtConfig>
  }

  interface NuxtOptions {
    wpNuxt?: Partial<WPNuxtConfig>
  }

  interface PublicRuntimeConfig {
    wordpressUrl?: string
    buildHash?: string
    wpNuxt?: {
      wordpressUrl?: string
      graphqlEndpoint?: string
      replaceLinks?: boolean
      cache?: {
        enabled?: boolean
        maxAge?: number
        swr?: boolean
      }
    }
  }
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'devtools:customTabs': (tabs: Array<{ name: string, title?: string, icon?: string }>) => void
  }
}

export {}
