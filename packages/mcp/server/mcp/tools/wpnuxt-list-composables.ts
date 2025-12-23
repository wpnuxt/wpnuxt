import { z } from 'zod'

/**
 * WPNuxt default queries - these are always available from @wpnuxt/core
 */
const DEFAULT_QUERIES = [
  { name: 'Menu', description: 'Fetch WordPress menu by name' },
  { name: 'NodeByUri', description: 'Fetch any content node by URI' },
  { name: 'Posts', description: 'Fetch list of posts' },
  { name: 'PostByUri', description: 'Fetch single post by URI' },
  { name: 'PostById', description: 'Fetch single post by ID' },
  { name: 'PostsByCategoryName', description: 'Fetch posts by category slug' },
  { name: 'PostsByCategoryId', description: 'Fetch posts by category ID' },
  { name: 'Pages', description: 'Fetch list of pages' },
  { name: 'PageByUri', description: 'Fetch single page by URI' },
  { name: 'PageById', description: 'Fetch single page by ID' },
  { name: 'GeneralSettings', description: 'Fetch WordPress general settings' },
  { name: 'Viewer', description: 'Fetch current authenticated user' },
  { name: 'Revisions', description: 'Fetch revisions for content node' }
]

export default defineMcpTool({
  description: `List WPNuxt composables available for the project.

Returns the default composables from @wpnuxt/core and explains the naming convention.

For detailed operation information, use the nuxt-graphql-middleware MCP tools:
- operations-list: List all operations in your project
- operations-get: Get operation details
- vue-graphql-composable-example: Generate Vue usage code
- schema-validate-document: Validate custom queries`,

  inputSchema: {
    includeMiddlewareHint: z.boolean().optional().describe('Include hint about nuxt-graphql-middleware tools (default: true)')
  },

  async handler({ includeMiddlewareHint = true }) {
    const composables = DEFAULT_QUERIES.map(q => ({
      name: q.name,
      composables: {
        sync: `use${q.name}`,
        async: `useAsync${q.name}`,
        lazy: `useLazy${q.name}`
      },
      description: q.description
    }))

    return jsonResult({
      summary: {
        defaultQueries: DEFAULT_QUERIES.length,
        totalComposables: DEFAULT_QUERIES.length * 3
      },

      variants: {
        description: 'Each query generates 3 composable variants:',
        sync: 'use{Name} - Synchronous, blocks rendering',
        async: 'useAsync{Name} - Works with Suspense',
        lazy: 'useLazy{Name} - Returns { data, pending, error }, recommended for pages'
      },

      defaultComposables: composables,

      usage: {
        note: 'Always use the lazy variant (useLazy*) in page components',
        examples: [
          'const { data: menu } = await useLazyMenu({ name: \'main\' })',
          'const { data: posts } = await useLazyPosts({ limit: 10 })',
          'const { data: node } = await useLazyNodeByUri({ uri: route.path })'
        ]
      },

      extendingQueries: {
        note: 'Add custom queries in extend/queries/*.gql',
        example: 'A query named "Products" generates useLazyProducts(), useAsyncProducts(), useProducts()'
      },

      ...(includeMiddlewareHint && {
        middlewareTools: {
          description: 'For detailed operation info, use nuxt-graphql-middleware MCP tools:',
          tools: [
            { name: 'operations-list', description: 'List all operations in your project (including custom ones)' },
            { name: 'operations-get', description: 'Get detailed operation metadata' },
            { name: 'vue-graphql-composable-example', description: 'Generate Vue composable usage code' },
            { name: 'schema-validate-document', description: 'Validate custom GraphQL queries' }
          ]
        }
      })
    })
  }
})
