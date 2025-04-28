import type { FetchError } from 'ofetch'
import type { OperationTypeNode } from 'graphql'
import { getRelativeImagePath } from '../util/images'
import type { AsyncData } from '#app'

const _useWPContent = async <T>(operation: OperationTypeNode, queryName: string, nodes: string[], fixImagePaths: boolean, params?: T) => {
  const { data, error } = await $fetch<AsyncData<T, FetchError | null>>('/api/wpContent', {
    method: 'POST',
    body: {
      operation,
      queryName,
      params
    }
  })
  return {
    data: data ? transformData(data, nodes, fixImagePaths) : undefined,
    error
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

export const useWPContent = _useWPContent
