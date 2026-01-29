import { getRelativeImagePath } from './images'

/**
 * Extracts nested data from a response object using a path of property names.
 *
 * @param data - The source data object
 * @param nodes - Array of property names forming the extraction path
 * @returns The extracted data or undefined if path doesn't exist
 *
 * @example
 * findData({ posts: { nodes: [{ id: 1 }] } }, ['posts', 'nodes'])
 * // Returns [{ id: 1 }]
 */
export const findData = (data: unknown, nodes: string[]): unknown => {
  if (nodes.length === 0) return data

  return nodes.reduce((acc: unknown, node: string) => {
    if (acc && typeof acc === 'object' && node in acc) {
      return (acc as Record<string, unknown>)[node]
    }
    return undefined
  }, data)
}

/**
 * Transforms extracted data and optionally fixes image paths.
 *
 * @param data - The source data object
 * @param nodes - Array of property names for extraction path
 * @param fixImagePaths - Whether to convert image URLs to relative paths
 * @returns Transformed data with optional relativePath added to featuredImage
 */
export const transformData = <T>(data: unknown, nodes: string[], fixImagePaths: boolean): T => {
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

/**
 * Normalizes URI parameters to ensure consistent cache keys between SSG prerender and runtime.
 * WordPress returns URIs with trailing slashes (e.g., '/hello-world/'), but Nuxt's route.path
 * may not have one (e.g., '/hello-world'). This mismatch causes different cache key hashes,
 * leading to cache misses during SSG client-side navigation.
 *
 * @param params - Query parameters object
 * @returns Parameters with normalized URI (trailing slash added if missing)
 *
 * @example
 * normalizeUriParam({ uri: '/hello-world' })
 * // Returns { uri: '/hello-world/' }
 */
export const normalizeUriParam = <T>(params: T): T => {
  if (!params || typeof params !== 'object') return params

  const paramsObj = params as Record<string, unknown>

  // Check for 'uri' parameter and normalize it
  if ('uri' in paramsObj && typeof paramsObj.uri === 'string') {
    const uri = paramsObj.uri
    // Add trailing slash if missing (matches WordPress URI format)
    const normalizedUri = uri.endsWith('/') ? uri : `${uri}/`
    return { ...paramsObj, uri: normalizedUri } as T
  }

  return params
}
