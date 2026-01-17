import { getRelativeImagePath } from '../util/images'
import type { Query } from '#nuxt-graphql-middleware/operation-types'
import type { WatchSource, Ref } from 'vue'
import type { NuxtApp } from 'nuxt/app'
import { computed, ref, watch as vueWatch, useAsyncGraphqlQuery } from '#imports'

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
  /** Enable client-side GraphQL caching. Default: true. Set to false for real-time data. */
  clientCache?: boolean
  /** Custom function to control when cached data should be used. */
  getCachedData?: (key: string, nuxtApp: NuxtApp, ctx: AsyncDataRequestContext) => unknown
  /** Number of automatic retries on failure. Set to 0 or false to disable. Default: 0 (disabled) */
  retry?: number | false
  /** Base delay in milliseconds between retries (uses exponential backoff). Default: 1000 */
  retryDelay?: number
  /** Request timeout in milliseconds. Default: 0 (disabled). Set to e.g. 30000 for 30 seconds. */
  timeout?: number
  /** Additional options to pass to useAsyncData */
  [key: string]: unknown
}

/** Context object passed to getCachedData (Nuxt 4+) */
interface AsyncDataRequestContext {
  /** What triggered the request: 'initial', 'refresh:manual', 'refresh:hook', or 'watch' */
  cause: 'initial' | 'refresh:manual' | 'refresh:hook' | 'watch'
}

/**
 * Fetch WordPress content using GraphQL with reactive state
 *
 * Follows Nuxt's useAsyncData pattern. Returns reactive refs immediately.
 * Supports SSG (static site generation) with proper payload caching.
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
 * @param queryName - The GraphQL query name
 * @param nodes - Array of nested property names to extract from response
 * @param fixImagePaths - Whether to convert image URLs to relative paths
 * @param params - Query variables
 * @param options - Options (lazy, server, immediate, watch, transform, clientCache, etc.)
 */
export const useWPContent = <T>(
  queryName: keyof Query,
  nodes: string[],
  fixImagePaths: boolean,
  params?: T,
  options?: WPContentOptions
) => {
  // Extract WPNuxt-specific options
  const {
    clientCache,
    getCachedData: userGetCachedData,
    retry: retryOption,
    retryDelay: retryDelayOption,
    timeout: timeoutOption,
    ...restOptions
  } = options ?? {}

  // Retry configuration
  const maxRetries = retryOption === false ? 0 : (retryOption ?? 0)
  const baseRetryDelay = retryDelayOption ?? 1000
  const retryCount = ref(0)
  const isRetrying = ref(false)

  // Timeout configuration (default: disabled, set to e.g. 30000 to enable)
  const timeoutMs = timeoutOption ?? 0

  // Create AbortController for timeout if enabled
  let abortController: AbortController | undefined
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  if (timeoutMs > 0) {
    abortController = new AbortController()
    timeoutId = setTimeout(() => {
      abortController?.abort()
      if (import.meta.dev) {
        console.warn(`[wpnuxt] Query "${String(queryName)}" timed out after ${timeoutMs}ms`)
      }
    }, timeoutMs)
  }

  // Custom getCachedData that supports SSG by checking static.data
  // nuxt-graphql-middleware's built-in getCachedData only checks payload.data,
  // but for SSG we also need to check static.data (prerendered payloads)
  // By passing our own getCachedData, we prevent the built-in one from being used
  const ssgGetCachedData = userGetCachedData ?? (clientCache === false
    ? () => undefined
    : (key: string, app: NuxtApp, ctx: { cause: string }) => {
        // During hydration, use payload data
        if (app.isHydrating) {
          return app.payload.data[key]
        }
        // For refresh actions, don't use cache (same as nuxt-graphql-middleware behavior)
        if (ctx.cause === 'refresh:manual' || ctx.cause === 'refresh:hook') {
          return undefined
        }
        // For SSG client navigation, check static.data (prerendered payloads)
        // Also check payload.data for SSR/ISR scenarios
        // Finally check the LRU cache for subsequent navigations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return app.static.data[key] ?? app.payload.data[key] ?? (app as any).$graphqlCache?.get(key)
      })

  // Build options for useAsyncGraphqlQuery
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asyncDataOptions: Record<string, any> = {
    ...restOptions,
    // Our getCachedData that properly checks static.data for SSG
    getCachedData: ssgGetCachedData,
    // Enable graphql caching so the LRU cache is populated for subsequent navigations
    graphqlCaching: { client: clientCache !== false },
    // Pass abort signal for timeout support
    ...(abortController && {
      fetchOptions: {
        ...(restOptions.fetchOptions as Record<string, unknown> ?? {}),
        signal: abortController.signal
      }
    })
  }

  // Use useAsyncGraphqlQuery with our custom getCachedData for SSG support
  // Our getCachedData takes precedence over the built-in one
  const { data, pending, refresh, execute, clear, error, status } = useAsyncGraphqlQuery(
    String(queryName) as keyof Query,
    params ?? {},
    asyncDataOptions
  )

  // Transformation error state
  const transformError: Ref<Error | null> = ref(null)

  // Clear timeout when request completes (success or error)
  // Uses immediate: true to handle cached data where pending starts as false
  if (timeoutId !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vueWatch(pending, (isPending: any) => {
      if (!isPending && timeoutId !== undefined) {
        clearTimeout(timeoutId)
        timeoutId = undefined
      }
    }, { immediate: true })
  }

  // Automatic retry logic with exponential backoff
  if (maxRetries > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vueWatch(error, async (newError: any) => {
      // Only retry on client-side and if we haven't exceeded max retries
      if (newError && !isRetrying.value && retryCount.value < maxRetries && import.meta.client) {
        isRetrying.value = true
        retryCount.value++

        // Exponential backoff: delay * 2^(attempt-1)
        const delay = baseRetryDelay * Math.pow(2, retryCount.value - 1)

        if (import.meta.dev) {
          console.warn(`[wpnuxt] Query "${String(queryName)}" failed, retrying in ${delay}ms (attempt ${retryCount.value}/${maxRetries})`)
        }

        await new Promise(resolve => setTimeout(resolve, delay))

        try {
          await refresh()
        } finally {
          isRetrying.value = false
        }
      }
    })

    // Reset retry count on successful fetch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vueWatch(data, (newData: any) => {
      if (newData && retryCount.value > 0) {
        retryCount.value = 0
      }
    })
  }

  const transformedData = computed(() => {
    // Reset transform error on each computation
    transformError.value = null

    try {
      // performRequest returns data wrapped in { data: GraphQLResponse }
      // The actual query response is in data.value.data
      const queryResult = data.value && typeof data.value === 'object' && data.value !== null && 'data' in data.value
        ? (data.value as Record<string, unknown>).data
        : undefined

      if (!queryResult) return undefined

      return transformData(queryResult, nodes, fixImagePaths)
    } catch (err) {
      // Log in development, silent in production
      if (import.meta.dev) {
        console.warn(`[wpnuxt] Data transformation error for "${String(queryName)}":`, err)
      }

      // Set transform error for consumer to handle
      transformError.value = err instanceof Error
        ? err
        : new Error('Failed to transform query response')

      return undefined
    }
  })

  return {
    data: transformedData,
    pending,
    refresh,
    execute,
    clear,
    error,
    status,
    /** Error from data transformation (separate from fetch error) */
    transformError,
    /** Current retry attempt count (0 if no retries or retries disabled) */
    retryCount,
    /** Whether a retry is currently in progress */
    isRetrying
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
