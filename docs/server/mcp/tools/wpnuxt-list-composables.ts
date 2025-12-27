import { z } from 'zod'

/**
 * WPNuxt default queries - these are always available from @wpnuxt/core
 * Each query generates 3 composable variants (sync, async, lazy)
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

/**
 * Core composables - manually registered composables from @wpnuxt/core
 * These are NOT auto-generated from queries
 */
const CORE_COMPOSABLES = [
  {
    name: 'usePrevNextPost',
    description: 'Gets previous and next posts for navigation based on current post slug',
    usage: 'const { prev, next } = await usePrevNextPost(\'my-post-slug\')',
    returns: '{ prev: { slug, uri, title } | null, next: { slug, uri, title } | null }'
  },
  {
    name: 'useWPContent',
    description: 'Low-level composable for fetching WordPress content via GraphQL. Returns reactive data with manual execute control.',
    usage: 'const { data, execute } = useWPContent<Variables>(\'QueryName\', [\'path\', \'to\', \'nodes\'], fixImagePaths, variables)',
    returns: '{ data: ComputedRef, execute: () => Promise }'
  },
  {
    name: 'useAsyncWPContent',
    description: 'Async version of useWPContent that works with Suspense',
    usage: 'const { data } = await useAsyncWPContent<Variables>(\'QueryName\', [\'path\', \'to\', \'nodes\'], fixImagePaths, variables)',
    returns: 'AsyncData with data, pending, error, refresh'
  }
]

/**
 * Utility functions exported from @wpnuxt/core
 */
const UTILITY_FUNCTIONS = [
  {
    name: 'getRelativeImagePath',
    description: 'Transforms WordPress absolute image URLs to relative paths',
    usage: 'const relativePath = getRelativeImagePath(absoluteUrl)',
    returns: 'string - relative path starting with /'
  }
]

export default defineMcpTool({
  description: `List WPNuxt composables available for the project.

Returns all composables from @wpnuxt/core:
- Auto-generated query composables (from .gql files)
- Core composables (usePrevNextPost, useWPContent, useAsyncWPContent)
- Utility functions (getRelativeImagePath)

For detailed operation information, use the nuxt-graphql-middleware MCP tools:
- operations-list: List all operations in your project
- operations-get: Get operation details
- vue-graphql-composable-example: Generate Vue usage code
- schema-validate-document: Validate custom queries`,

  inputSchema: {
    includeMiddlewareHint: z.boolean().optional().describe('Include hint about nuxt-graphql-middleware tools (default: true)')
  },

  async handler({ includeMiddlewareHint = true }) {
    const queryComposables = DEFAULT_QUERIES.map(q => ({
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
        generatedQueryComposables: DEFAULT_QUERIES.length * 3,
        coreComposables: CORE_COMPOSABLES.length,
        utilityFunctions: UTILITY_FUNCTIONS.length,
        total: DEFAULT_QUERIES.length * 3 + CORE_COMPOSABLES.length + UTILITY_FUNCTIONS.length
      },

      coreComposables: {
        description: 'Manually registered composables from @wpnuxt/core (always available)',
        composables: CORE_COMPOSABLES
      },

      utilityFunctions: {
        description: 'Utility functions exported from @wpnuxt/core',
        functions: UTILITY_FUNCTIONS
      },

      generatedComposables: {
        description: 'Auto-generated from default GraphQL queries. Each query generates 3 variants.',
        variants: {
          sync: 'use{Name} - Synchronous, blocks rendering',
          async: 'useAsync{Name} - Works with Suspense',
          lazy: 'useLazy{Name} - Returns { data, pending, error }, recommended for pages'
        },
        composables: queryComposables
      },

      usage: {
        note: 'Always use the lazy variant (useLazy*) in page components',
        examples: [
          'const { data: menu } = await useLazyMenu({ name: \'main\' })',
          'const { data: posts } = await useLazyPosts({ limit: 10 })',
          'const { prev, next } = await usePrevNextPost(currentSlug)'
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
