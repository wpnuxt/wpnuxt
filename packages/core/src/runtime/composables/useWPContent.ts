import { getRelativeImagePath } from '../util/images'
import type { Query } from '#nuxt-graphql-middleware/operation-types'
import type { WatchSource } from 'vue'
import type { NuxtApp } from 'nuxt/app'
import { computed, useAsyncGraphqlQuery } from '#imports'

/** Context object passed to getCachedData (Nuxt 4+) */
interface AsyncDataRequestContext {
  /** What triggered the request: 'initial', 'refresh:manual', 'refresh:hook', or 'watch' */
  cause: 'initial' | 'refresh:manual' | 'refresh:hook' | 'watch'
}

export interface WPContentOptions {
  /** Whether to resolve the async function after loading the route, instead of blocking client-side navigation. Default: false */
  lazy?: boolean
  /** Whether to fetch data on the server (during SSR). Default: true */
  server?: boolean
  /** Whether to fetch immediately. Default: true */
  immediate?: boolean
  /** Watch reactive sources to auto-refresh */
  watch?: (WatchSource<unknown> | object)[]
  /** Transform function to alter the result */
  transform?: (input: unknown) => unknown
  /** GraphQL caching options. Default: { client: true } */
  graphqlCaching?: { client?: boolean }
  /** Enable client-side GraphQL caching. Default: true. Set to false for real-time data. */
  clientCache?: boolean
  /** Custom cache key suffix for payload deduplication. Useful for locale-specific or complex caching scenarios. */
  cacheKey?: string
  /** Custom function to control when cached data should be used. */
  getCachedData?: (key: string, nuxtApp: NuxtApp, ctx: AsyncDataRequestContext) => unknown
  /** Additional options to pass to useAsyncGraphqlQuery */
  [key: string]: unknown
}

/**
 * Default getCachedData function for optimized caching behavior.
 *
 * - Returns payload data during hydration (SSR → client handoff)
 * - Returns cached data for client-side navigation (prevents unnecessary refetches)
 * - Returns undefined for manual refreshes (ensures fresh data)
 */
function defaultGetCachedData(key: string, nuxtApp: NuxtApp, ctx: AsyncDataRequestContext): unknown {
  // Always use payload during hydration (SSR → client)
  if (nuxtApp.isHydrating) {
    return nuxtApp.payload.data[key]
  }

  // For manual refresh, always fetch fresh data
  if (ctx.cause === 'refresh:manual' || ctx.cause === 'refresh:hook') {
    return undefined
  }

  // For client-side navigation ('initial') and watch-triggered refetches ('watch'),
  // use cached data if available to prevent unnecessary refetches
  return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
}

/**
 * Fetch WordPress content using GraphQL with reactive state
 *
 * Follows Nuxt's useAsyncData pattern. Returns reactive refs immediately.
 * Client-side GraphQL caching is enabled by default for better navigation performance.
 *
 * **Standard usage (with or without await - same behavior):**
 * ```ts
 * const { data: posts, pending } = usePosts() // or await usePosts()
 * ```
 * - Returns reactive refs immediately
 * - Data fetched during SSR and hydrated to client
 * - `pending` is true while fetching, false when done
 * - Uses Suspense during navigation (lazy: false by default)
 *
 * **Lazy loading (doesn't block navigation):**
 * ```ts
 * const { data: posts, pending } = usePosts(undefined, { lazy: true })
 * ```
 * - Doesn't use Suspense - navigation happens immediately
 * - Shows loading state (pending: true) while fetching
 * - Better for below-fold or non-critical content
 *
 * **Client-only execution:**
 * ```ts
 * const { data: posts } = usePosts(undefined, { server: false })
 * ```
 * - Skips SSR, only fetches on client
 *
 * **Disable client caching:**
 * ```ts
 * const { data: posts } = usePosts(undefined, { clientCache: false })
 * ```
 * - Useful for real-time data that should always be fresh
 *
 * **Custom cache key:**
 * ```ts
 * const { data: posts } = usePosts({ category: 'news' }, {
 *   cacheKey: `posts-news-${locale.value}`
 * })
 * ```
 * - Useful for locale-specific or complex caching scenarios
 *
 * @param queryName - The GraphQL query name
 * @param nodes - Array of nested property names to extract from response
 * @param fixImagePaths - Whether to convert image URLs to relative paths
 * @param params - Query variables
 * @param options - Options (lazy, server, immediate, watch, transform, clientCache, cacheKey, etc.)
 */
export const useWPContent = <T>(
  queryName: keyof Query,
  nodes: string[],
  fixImagePaths: boolean,
  params?: T,
  options?: WPContentOptions
) => {
  // Extract WPNuxt-specific options
  const { clientCache, cacheKey, getCachedData: userGetCachedData, ...restOptions } = options ?? {}

  // Determine graphqlCaching based on clientCache option (default: true)
  const graphqlCaching = clientCache === false
    ? { client: false }
    : restOptions.graphqlCaching ?? { client: true }

  // Generate a consistent cache key based on query name and params
  // This ensures the same query+params always uses the same key for getCachedData lookups
  const paramsKey = params ? JSON.stringify(params) : '{}'
  const baseKey = `wpnuxt-${String(queryName)}-${paramsKey}`
  const finalKey = cacheKey ? `${baseKey}-${cacheKey}` : baseKey

  // Determine getCachedData behavior:
  // - If user provides custom getCachedData, use it
  // - If clientCache is false, always return undefined to force fresh fetch
  // - Otherwise, use default implementation
  const effectiveGetCachedData = userGetCachedData
    ?? (clientCache === false ? () => undefined : defaultGetCachedData)

  // Build merged options
  const mergedOptions: Record<string, unknown> = {
    ...restOptions,
    graphqlCaching,
    // Explicit key ensures consistent cache lookups
    key: finalKey,
    getCachedData: effectiveGetCachedData
  }

  // Use nuxt-graphql-middleware's built-in client-side caching
  // Returns reactive refs immediately - works for both SSR and CSR
  const { data, pending, refresh, execute, clear, error, status } = useAsyncGraphqlQuery(
    queryName,
    params ?? {},
    mergedOptions
  )

  const transformedData = computed(() => {
    // useAsyncGraphqlQuery returns data wrapped in { data: GraphQLResponse }
    // The actual query response is in data.value.data
    const queryResult = data.value && typeof data.value === 'object' && data.value !== null && 'data' in data.value ? (data.value as Record<string, unknown>).data : undefined
    return queryResult ? transformData(queryResult, nodes, fixImagePaths) : undefined
  })

  return {
    data: transformedData,
    pending,
    refresh,
    execute,
    clear,
    error,
    status
  }
}

const transformData = <T>(data: unknown, nodes: string[], fixImagePaths: boolean): T => {
  const transformedData = findData(data, nodes)
  if (fixImagePaths && transformedData && typeof transformedData === 'object' && 'featuredImage' in transformedData) {
    const featuredImage = (transformedData as Record<string, unknown>).featuredImage
    if (featuredImage && typeof featuredImage === 'object' && 'node' in featuredImage) {
      const node = featuredImage.node
      if (node && typeof node === 'object' && 'sourceUrl' in node && typeof node.sourceUrl === 'string') {
        (node as Record<string, unknown>).relativePath = getRelativeImagePath(node.sourceUrl)
      }
    }
  }
  return transformedData as T
}

const findData = (data: unknown, nodes: string[]): unknown => {
  if (nodes.length === 0) return data

  return nodes.reduce((acc: unknown, node: string) => {
    if (acc && typeof acc === 'object' && node in acc) {
      return (acc as Record<string, unknown>)[node]
    }
    return undefined
  }, data)
}
