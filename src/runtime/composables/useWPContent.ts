import { getRelativeImagePath } from '../util/images'
import type { Query } from '#nuxt-graphql-middleware/operation-types'
import { useAsyncGraphqlQuery, useGraphqlQuery } from '#imports'

export const useWPContent = async <T>(queryName: keyof Query, nodes: string[], fixImagePaths: boolean, params?: T) => {
  const { data } = await useGraphqlQuery(queryName, params ? params : {})
  return {
    data: data ? transformData(data, nodes, fixImagePaths) : undefined
  }
}

export const useAsyncWPContent = async <T>(queryName: keyof Query, nodes: string[], fixImagePaths: boolean, params?: T) => {
  const { data, pending, refresh, execute, clear, error, status } = await useAsyncGraphqlQuery(queryName, params ? params : {})
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
  if (nodes.length > 0) {
    return nodes.reduce((acc, node) => {
      return acc[node] ?? acc
    }, data)
  }
}
