import type { FetchError } from 'ofetch'
import type { OperationTypeNode } from 'graphql'
import { getRelativeImagePath } from '../util/images'
import type { AsyncData } from '#app'
import { useRuntimeConfig } from '#imports'

interface WPContentResponse<T> {
  data?: T
  error?: FetchError | null
}

/**
 * Fetches content from WordPress via GraphQL
 *
 * @param operation - The GraphQL operation type (query or mutation)
 * @param queryName - The name of the GraphQL query to execute
 * @param nodes - Array of node names to traverse in the response data
 * @param fixImagePaths - Whether to convert absolute image URLs to relative paths
 * @param params - Optional query parameters/variables
 * @returns Promise with `data` and `error` properties
 *
 * @example
 * ```typescript
 * // Fetch posts with pagination
 * const { data, error } = await useWPContent('query', 'Posts', ['posts', 'nodes'], false, { first: 10 })
 *
 * // Fetch a single page by URI
 * const { data } = await useWPContent('query', 'Node', ['nodeByUri'], true, { uri: '/about' })
 * ```
 */
const _useWPContent = async <T>(
  operation: OperationTypeNode,
  queryName: string,
  nodes: string[],
  fixImagePaths: boolean,
  params?: T
): Promise<WPContentResponse<T>> => {
  try {
    const config = useRuntimeConfig()
    const wordpressUrl = config.public.wpNuxt.wordpressUrl

    const response = await $fetch<AsyncData<T, FetchError | null>>('/api/_wpnuxt/content', {
      method: 'POST',
      body: {
        operation,
        queryName,
        params
      }
    })

    const { data, error } = response

    // Handle error - could be a Ref with .value or a plain object
    const actualError = error && typeof error === 'object' && 'value' in error ? error.value : error

    if (actualError) {
      console.error(`[WPNuxt] Error fetching ${queryName}:`, actualError)
      return { data: undefined, error: actualError }
    }

    return {
      data: data ? transformData(data, nodes, fixImagePaths, wordpressUrl) : undefined,
      error: null
    }
  } catch (err) {
    const fetchError = err as FetchError
    console.error(`[WPNuxt] Failed to fetch ${queryName}:`, fetchError.message || err)
    return {
      data: undefined,
      error: fetchError
    }
  }
}

interface FeaturedImageData {
  featuredImage?: {
    node?: {
      sourceUrl?: string
      relativePath?: string
    }
  }
}

const fixMalformedUrls = (content: string, wordpressUrl: string): string => {
  // Fix malformed URLs that start with :port (e.g., ":4000/wp-admin/")
  // These get resolved relative to current domain causing issues like "http://localhost:3000:4000"
  const urlObj = new URL(wordpressUrl)
  const port = urlObj.port
  if (port) {
    // Replace href=":port/..." with href="wordpressUrl/..."
    const malformedPattern = new RegExp(`(href|src)=["']:${port}/`, 'g')
    content = content.replace(malformedPattern, `$1="${wordpressUrl}/`)
  }
  return content
}

const transformData = <T>(data: unknown, nodes: string[], fixImagePaths: boolean, wordpressUrl: string): T => {
  const transformedData = findData(data, nodes)
  if (transformedData && typeof transformedData === 'object') {
    // Fix malformed URLs in content field if it exists
    if ('content' in transformedData && typeof transformedData.content === 'string') {
      (transformedData as Record<string, unknown>).content = fixMalformedUrls(transformedData.content, wordpressUrl)
    }

    // Fix featured image paths if needed
    if (fixImagePaths && 'featuredImage' in transformedData) {
      const typed = transformedData as FeaturedImageData
      if (typed.featuredImage?.node?.sourceUrl) {
        typed.featuredImage.node.relativePath = getRelativeImagePath(typed.featuredImage.node.sourceUrl)
      }
    }
  }
  return transformedData as T
}

const findData = (data: unknown, nodes: string[]): unknown => {
  if (nodes.length === 0) return data
  if (nodes.length > 0) {
    return nodes.reduce((acc: Record<string, unknown>, node: string) => {
      if (acc && typeof acc === 'object' && node in acc) {
        return (acc as Record<string, unknown>)[node] as Record<string, unknown>
      }
      return acc
    }, data as Record<string, unknown>)
  }
  return data
}

export const useWPContent = _useWPContent
