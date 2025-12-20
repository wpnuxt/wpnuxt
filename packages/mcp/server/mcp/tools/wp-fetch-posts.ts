import { z } from 'zod'
import { executeGraphQL, POSTS_QUERY } from '../../utils/graphql'

export default defineMcpTool({
  description: 'Fetch posts from WordPress. Returns a list of blog posts with title, excerpt, categories, and metadata.',
  inputSchema: {
    first: z.number().min(1).max(100).optional().describe('Number of posts to fetch (1-100, default 10)'),
    after: z.string().optional().describe('Cursor for pagination')
  },
  async handler({ first = 10, after }) {
    const result = await executeGraphQL<{
      posts: {
        pageInfo: {
          hasNextPage: boolean
          endCursor: string
        }
        nodes: Array<{
          id: string
          databaseId: number
          title: string
          slug: string
          date: string
          excerpt: string
          uri: string
          featuredImage?: {
            node: {
              sourceUrl: string
              altText: string
            }
          }
          categories: {
            nodes: Array<{ name: string, slug: string }>
          }
          author: {
            node: { name: string }
          }
        }>
      }
    }>(POSTS_QUERY, { first, after })

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const posts = result.data?.posts

    return jsonResult({
      count: posts?.nodes.length ?? 0,
      hasNextPage: posts?.pageInfo.hasNextPage,
      endCursor: posts?.pageInfo.endCursor,
      posts: posts?.nodes.map(p => ({
        id: p.id,
        databaseId: p.databaseId,
        title: p.title,
        slug: p.slug,
        date: p.date,
        excerpt: p.excerpt?.replace(/<[^>]*>/g, '').trim(), // Strip HTML
        uri: p.uri,
        featuredImage: p.featuredImage?.node.sourceUrl,
        categories: p.categories.nodes.map(c => c.name),
        author: p.author?.node.name
      }))
    })
  }
})
