import { z } from 'zod'
import { executeGraphQL, PAGES_QUERY } from '../../utils/graphql'

export default defineMcpTool({
  description: 'Fetch pages from WordPress. Returns a list of pages with title, hierarchy, and metadata.',
  inputSchema: {
    first: z.number().min(1).max(100).optional().describe('Number of pages to fetch (1-100, default 10)'),
    after: z.string().optional().describe('Cursor for pagination')
  },
  async handler({ first = 10, after }) {
    const result = await executeGraphQL<{
      pages: {
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
          uri: string
          parentId?: string
          featuredImage?: {
            node: {
              sourceUrl: string
              altText: string
            }
          }
        }>
      }
    }>(PAGES_QUERY, { first, after })

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const pages = result.data?.pages

    return jsonResult({
      count: pages?.nodes.length ?? 0,
      hasNextPage: pages?.pageInfo.hasNextPage,
      endCursor: pages?.pageInfo.endCursor,
      pages: pages?.nodes.map(p => ({
        id: p.id,
        databaseId: p.databaseId,
        title: p.title,
        slug: p.slug,
        date: p.date,
        uri: p.uri,
        parentId: p.parentId,
        featuredImage: p.featuredImage?.node.sourceUrl
      }))
    })
  }
})
