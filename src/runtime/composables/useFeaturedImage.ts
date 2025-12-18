import { getRelativeImagePath } from '../util/images'
import type { NodeWithFeaturedImage } from '#graphql-operations'

/**
 * Extracts and converts the featured image URL to a relative path
 *
 * @param contentNode - A WordPress content node with a featured image
 * @returns The relative path to the featured image, or undefined if not available
 *
 * @example
 * ```typescript
 * // Get featured image from a post
 * const imagePath = useFeaturedImage(post)
 * // Returns: '/wp-content/uploads/2024/01/image.jpg'
 *
 * // Use in a template
 * <img v-if="imagePath" :src="imagePath" alt="Featured image" />
 * ```
 */
const _useFeaturedImage = (contentNode: NodeWithFeaturedImage): string | undefined => {
  const sourceUrl = contentNode?.featuredImage?.node?.sourceUrl
  if (sourceUrl) return getRelativeImagePath(sourceUrl)
  else return undefined
}

export const useFeaturedImage = _useFeaturedImage
