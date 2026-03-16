import { useWPContent } from './useWPContent'
import type { WPContentOptions } from './useWPContent'
import type { Query } from '#nuxt-graphql-middleware/operation-types'
import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue, watch as vueWatch } from '#imports'

interface WPPageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string | null
  endCursor?: string | null
}

/**
 * Fetch a WPGraphQL connection with pagination support.
 *
 * Splits the response into data (nodes array) and pageInfo. Supports both
 * page-based navigation (manual cursor management) and infinite scroll
 * via the `loadMore()` function which accumulates items across pages.
 *
 * @param queryName - The GraphQL query name
 * @param connectionPath - Path to the connection object (e.g., ['posts'])
 * @param fixImagePaths - Whether to convert image URLs to relative paths
 * @param params - Query variables (supports reactive refs/computed/getters)
 * @param options - Same options as useWPContent
 *
 * @example
 * ```ts
 * // Page-based: manage cursors yourself via reactive params
 * const after = ref<string>()
 * const params = computed(() => ({ first: 10, after: after.value }))
 * const { data, pageInfo } = await usePaginatedPosts(params)
 *
 * // Infinite scroll: use loadMore() to accumulate items
 * const { data, pageInfo, loadMore } = await usePaginatedPosts({ first: 10 })
 * // data.value starts with first 10 items
 * await loadMore() // data.value now has 20 items
 * ```
 */
export const useWPConnection = <T>(
  queryName: keyof Query,
  connectionPath: string[],
  fixImagePaths: boolean,
  params?: MaybeRefOrGetter<T>,
  options?: WPContentOptions
) => {
  // Internal cursor for loadMore — merges with user params
  const loadMoreCursor = ref<string | null>(null)
  const isLoadingMore = ref(false)
  const accumulatedItems = ref<unknown[]>([])

  // Merge user params with internal loadMore cursor
  const mergedParams = computed(() => {
    const userParams = (toValue(params) ?? {}) as Record<string, unknown>
    if (loadMoreCursor.value) {
      return { ...userParams, after: loadMoreCursor.value }
    }
    return userParams
  })

  // Use useWPContent with merged params — it extracts the connection object
  const result = useWPContent(queryName, connectionPath, fixImagePaths, mergedParams, options)

  // Extract current page's nodes from the connection object
  const currentNodes = computed(() => {
    const connection = result.data.value as Record<string, unknown> | undefined
    if (!connection || typeof connection !== 'object') return undefined
    const nodes = connection.nodes
    return Array.isArray(nodes) ? nodes : undefined
  })

  const pageInfo = computed(() => {
    const connection = result.data.value as Record<string, unknown> | undefined
    if (!connection || typeof connection !== 'object') return undefined
    return connection.pageInfo as WPPageInfo | undefined
  })

  // Watch for data changes to handle accumulation
  vueWatch(currentNodes, (newNodes) => {
    if (!newNodes?.length) return
    if (isLoadingMore.value) {
      // loadMore: append new nodes
      accumulatedItems.value = [...accumulatedItems.value, ...newNodes]
      isLoadingMore.value = false
    } else {
      // Fresh fetch (initial load or user changed params): replace
      accumulatedItems.value = [...newNodes]
      loadMoreCursor.value = null
    }
  }, { immediate: true })

  // Data: return accumulated items (covers both page-based and loadMore usage)
  const connectionData = computed(() => {
    return accumulatedItems.value.length > 0 ? accumulatedItems.value : currentNodes.value
  })

  /**
   * Fetch the next page and append results to the existing data.
   * Uses the current endCursor from pageInfo automatically.
   */
  async function loadMore() {
    if (!pageInfo.value?.hasNextPage || !pageInfo.value.endCursor) return
    isLoadingMore.value = true
    loadMoreCursor.value = pageInfo.value.endCursor
    // The mergedParams computed updates → auto-watch triggers re-fetch
    // The watch on currentNodes will append the new items
  }

  const returnValue = {
    data: connectionData,
    pageInfo,
    loadMore,
    pending: result.pending,
    refresh: async () => {
      // Reset accumulation on manual refresh
      accumulatedItems.value = []
      loadMoreCursor.value = null
      isLoadingMore.value = false
      await result.refresh()
    },
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
