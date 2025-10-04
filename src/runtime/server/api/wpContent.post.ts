import type { H3Event } from 'h3'
import { readBody, createError } from 'h3'
import { LRUCache } from 'lru-cache'
import { defineCachedEventHandler } from 'nitro/runtime'
import { useRuntimeConfig } from '#imports'

interface GraphqlResponse {
  data: unknown
  errors?: Array<{ message: string }>
}

interface WPContentRequestBody {
  queryName: string
  operation?: 'query' | 'mutation'
  params?: Record<string, unknown>
}

interface CachedGraphQLResponse {
  data: unknown
  error?: unknown
  timestamp: number
}

// In-memory LRU cache for hot queries (faster than HTTP cache layer)
const queryCache = new LRUCache<string, CachedGraphQLResponse>({
  max: 500, // Maximum 500 cached queries
  ttl: 1000 * 60 * 5, // 5 minutes TTL
  updateAgeOnGet: true, // Refresh TTL on access
  updateAgeOnHas: false
})

/**
 * Fast hash function for cache keys (much faster than SHA-256)
 * Uses FNV-1a hash algorithm
 */
function fastHash(str: string): string {
  let hash = 2166136261 // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return (hash >>> 0).toString(36)
}

/**
 * Get or create cached request body to avoid reading stream twice
 */
async function getCachedBody(event: H3Event): Promise<WPContentRequestBody> {
  if (!event.context._wpContentBody) {
    event.context._wpContentBody = await readBody<WPContentRequestBody>(event)
  }
  return event.context._wpContentBody
}

export default defineCachedEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig().public.wpNuxt
  const body = await getCachedBody(event)

  if (!body || !body.queryName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'The request must contain a queryName'
    })
  }

  // Generate cache key for memory cache
  const memoryCacheKey = `${body.queryName}_${body.params ? fastHash(JSON.stringify(body.params)) : 'no-params'}`

  // Check in-memory cache first (much faster than HTTP layer)
  const cached = queryCache.get(memoryCacheKey)
  if (cached && config?.enableCache) {
    return {
      data: cached.data,
      error: cached.error
    }
  }

  try {
    const operation = body.operation || 'query'
    const response = await $fetch<GraphqlResponse>(
      `/api/graphql_middleware/${operation}/${body.queryName}`,
      {
        method: operation === 'mutation' ? 'POST' : 'GET',
        params: operation === 'query' ? buildRequestParams(body.params) : undefined,
        body: operation === 'mutation' ? body.params : undefined,
        headers: {
          Authorization: `Bearer ${event.context.accessToken || ''}`
        }
      }
    )

    if (response.errors && response.errors.length > 0) {
      console.error(`[WPNuxt] GraphQL errors for ${body.queryName}:`, response.errors)
    }

    const result = {
      data: response.data,
      error: response.errors || undefined
    }

    // Store in memory cache for subsequent requests (only for queries, not mutations)
    if (operation === 'query' && config?.enableCache) {
      queryCache.set(memoryCacheKey, {
        data: result.data,
        error: result.error,
        timestamp: Date.now()
      })
    }

    return result
  } catch (error) {
    console.error(`[WPNuxt] Failed to fetch GraphQL query ${body.queryName}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: `Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}, {
  group: 'api',
  name: 'wpContent',
  getKey: async (event: H3Event) => {
    const body = await getCachedBody(event)
    const paramsHash = body.params
      ? fastHash(JSON.stringify(body.params))
      : ''
    return `${body.queryName}${paramsHash ? `_${paramsHash}` : ''}`
  },
  swr: true,
  maxAge: useRuntimeConfig().public.wpNuxt?.cacheMaxAge || 300
})

/**
 * Get the parameters for the GraphQL middleware query.
 * Converts complex objects to a JSON string to pass as a single query parameter.
 *
 * @param variables - The GraphQL query variables
 * @returns Query parameters suitable for GET requests
 */
export function buildRequestParams(
  variables?: Record<string, unknown> | undefined | null
): Record<string, string> {
  if (!variables) {
    return {}
  }
  // Determine if each variable can safely be passed as query parameter.
  // This is only the case for strings.
  for (const key in variables) {
    if (typeof variables[key] !== 'string') {
      return {
        __variables: JSON.stringify(variables)
      }
    }
  }

  return variables as Record<string, string>
}
