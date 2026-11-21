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
      sitemap?: {
        postTypes?: string[]
        exclude?: string[]
        taxonomies?: boolean
      }
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
    /**
     * Contribute additional GraphQL query folders to WPNuxt's merged queries.
     *
     * Called by @wpnuxt/core at `modules:done`, so modules can register this
     * hook during their own setup regardless of module order in nuxt.config.
     * Push absolute folder paths; `.gql`/`.graphql` files are copied
     * recursively into the merged output folder.
     *
     * Precedence: core defaults < CPT auto-generation < contributed folders
     * < user `extend/queries/`. Same-named files override earlier ones, so a
     * contributed `Post.fragment.gql` replaces the default, while users can
     * still override contributed fragments.
     *
     * Note: contributed folders are intended for fragments. Contributed
     * queries are sent to nuxt-graphql-middleware but do NOT get generated
     * `use*()` composables (composable generation runs before this hook).
     *
     * @example
     * ```ts
     * // in a sibling module's setup()
     * nuxt.hook('wpnuxt:queries:folders', (folders) => {
     *   folders.push(resolve('./runtime/queries'))
     * })
     * ```
     */
    'wpnuxt:queries:folders': (folders: string[]) => void | Promise<void>
  }
}

export {}
