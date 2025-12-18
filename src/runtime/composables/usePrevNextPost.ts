import { OperationTypeNode } from 'graphql'
import { useWPContent } from '#imports'

/**
 * Gets the previous and next post slugs for navigation
 *
 * @param currentPostPath - The current post's path/slug (with or without slashes)
 * @returns Object with `prev` and `next` post slugs, or null if not available
 *
 * @example
 * ```typescript
 * // Get prev/next posts for navigation
 * const { prev, next } = await usePrevNextPost('/my-blog-post/')
 *
 * // Use in navigation
 * <NuxtLink v-if="prev" :to="`/blog/${prev}`">Previous Post</NuxtLink>
 * <NuxtLink v-if="next" :to="`/blog/${next}`">Next Post</NuxtLink>
 * ```
 */
const _usePrevNextPost = async (currentPostPath: string) => {
  const currentPostSlug = currentPostPath.replaceAll('/', '')
  const allPosts = await getAllPosts()
  if (!allPosts) return { prev: null, next: null }
  const currentIndex: number = allPosts.slugs.findIndex((slug: string | null | undefined) => slug === currentPostSlug)
  const nextPost = currentIndex > 0 ? allPosts.slugs[currentIndex - 1] : null
  const prevPost = allPosts.slugs.length > (currentIndex + 1) ? allPosts.slugs[currentIndex + 1] : null

  return {
    prev: prevPost ?? null,
    next: nextPost ?? null
  }
}

interface Post {
  slug?: string
}

const getAllPosts = async () => {
  const { data: allPosts } = await useWPContent(OperationTypeNode.QUERY, 'Posts', ['posts', 'nodes'], false)
  if (allPosts && Array.isArray(allPosts)) {
    return {
      slugs: allPosts.map((post: Post) => {
        if (post) return post.slug
        else return null
      })
    }
  }
  return
}

export const usePrevNextPost = _usePrevNextPost
