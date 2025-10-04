import type { FetchError } from 'ofetch'
import type { OperationTypeNode } from 'graphql'
import { getRelativeImagePath } from '../util/images'
import type { AsyncData } from '#app'

interface WPContentResponse<T> {
  data?: T
  error?: FetchError | null
}

/**
 * Fetches content from WordPress via GraphQL
 *
 * @param operation - The GraphQL operation type (query or mutation)
 * @param queryName - The name of the GraphQL query
 * @param nodes - Array of node names to traverse in the response
 * @param fixImagePaths - Whether to convert image URLs to relative paths
 * @param params - Optional query parameters
 * @returns Promise with data and error properties
 */
const _useWPContent = async <T>(
  operation: OperationTypeNode,
  queryName: string,
  nodes: string[],
  fixImagePaths: boolean,
  params?: T
): Promise<WPContentResponse<T>> => {
  try {
    const { data, error } = await $fetch<AsyncData<T, FetchError | null>>('/api/wpContent', {
      method: 'POST',
      body: {
        operation,
        queryName,
        params
      }
    })

    if (error) {
      console.error(`[WPNuxt] Error fetching ${queryName}:`, error)
      return { data: undefined, error }
    }

    return {
      data: data ? transformData(data, nodes, fixImagePaths) : undefined,
      error
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

const transformData = <T>(data: unknown, nodes: string[], fixImagePaths: boolean): T => {
  const transformedData = findData(data, nodes)
  if (fixImagePaths && transformedData?.featuredImage?.node?.sourceUrl) {
    transformedData.featuredImage.node.relativePath
      = getRelativeImagePath(transformedData.featuredImage.node.sourceUrl)
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
