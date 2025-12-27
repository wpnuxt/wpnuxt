import { useWPContent } from './useWPContent'

interface PostNode {
  slug?: string | null
  uri?: string | null
  title?: string | null
}

interface PrevNextResult {
  prev: PostNode | null
  next: PostNode | null
}

/**
 * Gets the previous and next posts for navigation.
 *
 * Uses the full posts list (cached) and finds adjacent posts by index.
 * Posts are sorted by date descending, so:
 * - "prev" = older post (higher index)
 * - "next" = newer post (lower index)
 *
 * @param currentSlug - The current post's slug (without slashes)
 * @returns Object with `prev` and `next` post objects containing slug, uri, and title
 *
 * @example
 * ```typescript
 * const { prev, next } = await usePrevNextPost('my-blog-post')
 *
 * // Use in navigation
 * <NuxtLink v-if="prev" :to="prev.uri">{{ prev.title }}</NuxtLink>
 * <NuxtLink v-if="next" :to="next.uri">{{ next.title }}</NuxtLink>
 * ```
 */
export async function usePrevNextPost(currentSlug: string): Promise<PrevNextResult> {
  // Fetch all posts using WPNuxt's content composable (cached automatically)
  // The Posts query returns posts sorted by date DESC by default
  const { data, execute } = useWPContent<{ limit: number }>('Posts', ['posts', 'nodes'], false, { limit: 100 })

  // Ensure data is fetched (execute returns a promise)
  await execute()

  // data is a computed ref - get the value
  const allPosts = (data.value as PostNode[] | undefined) || []

  if (!allPosts.length) {
    return { prev: null, next: null }
  }

  // Clean the slug (remove leading/trailing slashes)
  const cleanSlug = currentSlug.replace(/^\/|\/$/g, '')

  // Find current post index
  const currentIndex = allPosts.findIndex(
    (post: PostNode) => post.slug === cleanSlug
  )

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  // Posts are sorted by date DESC, so:
  // - prev (older) = higher index
  // - next (newer) = lower index
  const prevPost = currentIndex < allPosts.length - 1
    ? allPosts[currentIndex + 1]
    : null

  const nextPost = currentIndex > 0
    ? allPosts[currentIndex - 1]
    : null

  return {
    prev: prevPost ?? null,
    next: nextPost ?? null
  }
}
