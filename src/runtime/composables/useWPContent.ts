import { getRelativeImagePath } from '../util/images'
import type { Query } from '#nuxt-graphql-middleware/operation-types'
import { computed, useAsyncGraphqlQuery } from '#imports'

export interface WPContentOptions {
  /** Whether to resolve the async function after loading the route, instead of blocking client-side navigation. Default: false */
  lazy?: boolean
  /** Whether to fetch data on the server (during SSR). Default: true */
  server?: boolean
  /** Whether to fetch immediately. Default: true */
  immediate?: boolean
  /** Watch reactive sources to auto-refresh */
  watch?: unknown[]
  /** Transform function to alter the result */
  transform?: (input: unknown) => unknown
  /** Additional options to pass to useAsyncGraphqlQuery */
  [key: string]: unknown
}

/**
 * Fetch WordPress content using GraphQL with reactive state
 *
 * Follows Nuxt's useAsyncData pattern. Returns reactive refs immediately.
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
 * **Lazy variant (doesn't block navigation):**
 * ```ts
 * const { data: posts, pending } = useLazyPosts()
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
 * @param queryName - The GraphQL query name
 * @param nodes - Array of nested property names to extract from response
 * @param fixImagePaths - Whether to convert image URLs to relative paths
 * @param params - Query variables
 * @param options - Options (lazy, server, immediate, watch, transform, etc.)
 */
export const useWPContent = <T>(
  queryName: keyof Query,
  nodes: string[],
  fixImagePaths: boolean,
  params?: T,
  options?: WPContentOptions
) => {
  // Use nuxt-graphql-middleware's built-in client-side caching
  // Returns reactive refs immediately - works for both SSR and CSR
  const { data, pending, refresh, execute, clear, error, status } = useAsyncGraphqlQuery(
    queryName,
    params ?? {},
    options
  )

  const transformedData = computed(() => {
    // useAsyncGraphqlQuery returns data wrapped in { data: GraphQLResponse }
    // The actual query response is in data.value.data
    const queryResult = data.value?.data
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
  if (fixImagePaths && transformedData?.featuredImage?.node?.sourceUrl) {
    transformedData.featuredImage.node.relativePath
      = getRelativeImagePath(transformedData.featuredImage.node.sourceUrl)
  }
  return transformedData as T
}

const findData = (data: unknown, nodes: string[]) => {
  if (nodes.length === 0) return data

  return nodes.reduce((acc, node) => {
    return acc?.[node]
  }, data)
}
