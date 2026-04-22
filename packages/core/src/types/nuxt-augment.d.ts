import type { WPNuxtConfig } from './config'

declare module 'nuxt/schema' {
  interface NuxtConfig {
    wpNuxt?: Partial<WPNuxtConfig>
  }

  interface NuxtOptions {
    wpNuxt?: Partial<WPNuxtConfig>
  }

  interface RuntimeConfig {
    wpNuxtRevalidateSecret?: string
  }

  interface PublicRuntimeConfig {
    wordpressUrl?: string
    buildHash?: string
    wpNuxt?: {
      wordpressUrl?: string
      graphqlEndpoint?: string
      replaceLinks?: boolean
      imageRelativePaths?: boolean
      hasBlocks?: boolean
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
    /**
     * Fired on every WPNuxt-mediated GraphQL request completion.
     *
     * Emitted once per fetch attempt (refresh/execute fire again; cache hits
     * do not fire). Fire-and-forget — handler errors are isolated and logged
     * only in development.
     *
     * @example
     * ```ts
     * // plugins/wpnuxt-telemetry.ts
     * export default defineNuxtPlugin((nuxtApp) => {
     *   nuxtApp.hook('wpnuxt:query', (payload) => {
     *     console.log(`[gql] ${payload.queryType} ${payload.queryName} ${payload.status} (${payload.durationMs}ms)`)
     *   })
     * })
     * ```
     */
    'wpnuxt:query': (payload: {
      queryName: string
      queryType: 'query' | 'mutation'
      variables: Record<string, unknown> | undefined
      durationMs: number
      status: 'success' | 'error'
      error?: Error
    }) => void | Promise<void>
  }
}

export {}
