import { OperationTypeNode } from 'graphql'
import { useWPContent } from './useWPContent'

const _usePrevNextPost = async (currentPostPath: string) => {
  const currentPostSlug = currentPostPath.replaceAll('/', '')
  const allPosts = await getAllPosts()
  if (!allPosts) return { prev: null, next: null }
  const currentIndex: number = allPosts.slugs.findIndex((slug: string) => slug === currentPostSlug)
  const nextPost = currentIndex > 0 ? allPosts.slugs[currentIndex - 1] : null
  const prevPost = allPosts.slugs.length > (currentIndex + 1) ? allPosts.slugs[currentIndex + 1] : null

  return {
    prev: prevPost ? prevPost : null,
    next: nextPost ? nextPost : null
  }
}

const getAllPosts = async () => {
  const { data: allPosts } = await useWPContent(OperationTypeNode.QUERY, 'Posts', ['posts', 'nodes'], false)
  if (allPosts) {
    return {
      slugs: allPosts?.map((post) => {
        if (post) return post.slug
        else return null
      })
    }
  }
  return
}

export const usePrevNextPost = _usePrevNextPost
