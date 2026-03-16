import { useWPContent } from './useWPContent'
import type { WPContentOptions } from './useWPContent'
import type { Query } from '#nuxt-graphql-middleware/operation-types'
import type { MaybeRefOrGetter } from 'vue'
import { computed } from '#imports'

/**
 * Fetch a WPGraphQL connection with pagination support.
 *
 * Works like useWPContent but splits the result into data (nodes array)
 * and pageInfo for cursor-based pagination.
 *
 * @param queryName - The GraphQL query name
 * @param connectionPath - Path to the connection object (e.g., ['posts'])
 * @param fixImagePaths - Whether to convert image URLs to relative paths
 * @param params - Query variables (supports reactive refs/computed/getters)
 * @param options - Same options as useWPContent
 *
 * @example
 * ```ts
 * // Query with pageInfo:
 * // query PaginatedPosts($first: Int, $after: String) {
 * //   posts(first: $first, after: $after) {
 * //     pageInfo { hasNextPage endCursor }
 * //     nodes { ...Post }
 * //   }
 * // }
 *
 * const { data, pageInfo, pending } = await usePaginatedPosts({ first: 10 })
 * // data.value is PostFragment[]
 * // pageInfo.value is { hasNextPage: true, endCursor: "..." }
 * ```
 */
export const useWPConnection = <T>(
  queryName: keyof Query,
  connectionPath: string[],
  fixImagePaths: boolean,
  params?: MaybeRefOrGetter<T>,
  options?: WPContentOptions
) => {
  // Use useWPContent with the connection path — it extracts the connection object
  const result = useWPContent(queryName, connectionPath, fixImagePaths, params, options)

  // Split the connection object into nodes (data) and pageInfo
  const connectionData = computed(() => {
    const connection = result.data.value as Record<string, unknown> | undefined
    if (!connection || typeof connection !== 'object') return undefined
    const nodes = connection.nodes
    return Array.isArray(nodes) ? nodes : undefined
  })

  const pageInfo = computed(() => {
    const connection = result.data.value as Record<string, unknown> | undefined
    if (!connection || typeof connection !== 'object') return undefined
    return connection.pageInfo as { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } | undefined
  })

  const returnValue = {
    data: connectionData,
    pageInfo,
    pending: result.pending,
    refresh: result.refresh,
    execute: result.execute,
    clear: result.clear,
    error: result.error,
    status: result.status,
    transformError: result.transformError,
    retryCount: result.retryCount,
    isRetrying: result.isRetrying
  }

  // Preserve thenable behavior for await support
  const thenable = result as typeof result & PromiseLike<typeof result>
  return Object.assign(
    thenable.then(() => returnValue),
    returnValue
  )
}
