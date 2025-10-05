import { getRelativeImagePath } from '../util/images'
import type { Query } from '#nuxt-graphql-middleware/operation-types'
import { useAsyncGraphqlQuery, useGraphqlQuery } from '#imports'

/**
 * Synchronously fetch WordPress content using GraphQL
 * Use this in <script setup> with await for immediate data fetching
 *
 * @param queryName - The GraphQL query name
 * @param nodes - Array of nested property names to extract from response
 * @param fixImagePaths - Whether to convert image URLs to relative paths
 * @param params - Query variables
 */
export const useWPContent = async <T>(queryName: keyof Query, nodes: string[], fixImagePaths: boolean, params?: T) => {
  // Use nuxt-graphql-middleware's built-in client-side caching
  const { data } = await useGraphqlQuery(queryName, params ?? {})
  return {
    data: data ? transformData(data, nodes, fixImagePaths) : undefined
  }
}

/**
 * Asynchronously fetch WordPress content using GraphQL
 * Returns AsyncData with reactive data, pending state, and refresh capabilities
 *
 * @param queryName - The GraphQL query name
 * @param nodes - Array of nested property names to extract from response
 * @param fixImagePaths - Whether to convert image URLs to relative paths
 * @param params - Query variables
 */
export const useAsyncWPContent = async <T>(queryName: keyof Query, nodes: string[], fixImagePaths: boolean, params?: T) => {
  // Use nuxt-graphql-middleware's built-in client-side caching
  const { data, pending, refresh, execute, clear, error, status } = await useAsyncGraphqlQuery(queryName, params ?? {})

  return {
    data: data.value ? transformData(data.value?.data, nodes, fixImagePaths) : undefined,
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
    return acc?.[node] ?? acc
  }, data)
}
