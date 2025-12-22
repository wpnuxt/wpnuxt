import { z } from 'zod'
import { executeGraphQL, INTROSPECTION_QUERY } from '../../utils/graphql'

/**
 * Default queries provided by @wpnuxt/core
 * These are always available and generate composables
 */
const DEFAULT_QUERIES = [
  {
    name: 'Menu',
    file: 'Menu.gql',
    parameters: [
      { name: 'name', type: 'ID', default: 'main', description: 'Menu name or ID' },
      { name: 'idType', type: 'MenuNodeIdTypeEnum', default: 'NAME' }
    ],
    returns: 'menu.menuItems.nodes',
    description: 'Fetch a WordPress menu by name',
    example: "useLazyMenu({ name: 'main' })"
  },
  {
    name: 'NodeByUri',
    file: 'Node.gql',
    parameters: [
      { name: 'uri', type: 'String', required: true, description: 'The URI of the content node' }
    ],
    returns: 'nodeByUri',
    description: 'Fetch any content node (page, post, CPT) by its URI',
    example: "useLazyNodeByUri({ uri: '/about/' })"
  },
  {
    name: 'Posts',
    file: 'Posts.gql',
    parameters: [
      { name: 'limit', type: 'Int', default: 10, description: 'Number of posts to fetch' }
    ],
    returns: 'posts.nodes',
    description: 'Fetch a list of posts',
    example: 'useLazyPosts({ limit: 10 })'
  },
  {
    name: 'PostByUri',
    file: 'Posts.gql',
    parameters: [
      { name: 'uri', type: 'String', required: true, description: 'The URI of the post' }
    ],
    returns: 'nodeByUri',
    description: 'Fetch a single post by its URI',
    example: "useLazyPostByUri({ uri: '/2024/01/hello-world/' })"
  },
  {
    name: 'PostById',
    file: 'Posts.gql',
    parameters: [
      { name: 'id', type: 'ID', required: true, description: 'Database ID of the post' },
      { name: 'asPreview', type: 'Boolean', default: false }
    ],
    returns: 'post',
    description: 'Fetch a single post by database ID',
    example: 'useLazyPostById({ id: "123" })'
  },
  {
    name: 'PostsByCategoryName',
    file: 'Posts.gql',
    parameters: [
      { name: 'categoryName', type: 'String', required: true, description: 'Category slug' },
      { name: 'limit', type: 'Int', default: 10 }
    ],
    returns: 'posts.nodes',
    description: 'Fetch posts by category name/slug',
    example: "useLazyPostsByCategoryName({ categoryName: 'news', limit: 5 })"
  },
  {
    name: 'PostsByCategoryId',
    file: 'Posts.gql',
    parameters: [
      { name: 'categoryId', type: 'Int', required: true, description: 'Category database ID' },
      { name: 'limit', type: 'Int', default: 10 }
    ],
    returns: 'posts.nodes',
    description: 'Fetch posts by category ID',
    example: 'useLazyPostsByCategoryId({ categoryId: 5, limit: 10 })'
  },
  {
    name: 'Pages',
    file: 'Pages.gql',
    parameters: [
      { name: 'limit', type: 'Int', default: 10, description: 'Number of pages to fetch' }
    ],
    returns: 'pages.nodes',
    description: 'Fetch a list of pages',
    example: 'useLazyPages({ limit: 10 })'
  },
  {
    name: 'PageByUri',
    file: 'Pages.gql',
    parameters: [
      { name: 'uri', type: 'String', required: true, description: 'The URI of the page' }
    ],
    returns: 'nodeByUri',
    description: 'Fetch a single page by its URI',
    example: "useLazyPageByUri({ uri: '/about/' })"
  },
  {
    name: 'PageById',
    file: 'Pages.gql',
    parameters: [
      { name: 'id', type: 'ID', required: true, description: 'Database ID of the page' }
    ],
    returns: 'page',
    description: 'Fetch a single page by database ID',
    example: 'useLazyPageById({ id: "42" })'
  },
  {
    name: 'GeneralSettings',
    file: 'GeneralSettings.gql',
    parameters: [],
    returns: 'generalSettings',
    description: 'Fetch WordPress general settings',
    example: 'useLazyGeneralSettings()'
  },
  {
    name: 'Viewer',
    file: 'Viewer.gql',
    parameters: [],
    returns: 'viewer',
    description: 'Fetch current authenticated user',
    example: 'useLazyViewer()'
  },
  {
    name: 'Revisions',
    file: 'Revisions.gql',
    parameters: [
      { name: 'id', type: 'ID', required: true, description: 'Content node ID' }
    ],
    returns: 'revisions.nodes',
    description: 'Fetch revisions for a content node',
    example: 'useLazyRevisions({ id: "123" })'
  }
]

/**
 * Plugin-specific queries that become available when plugins are detected
 */
const PLUGIN_QUERIES: Record<string, Array<{
  name: string
  parameters: Array<{ name: string; type: string; required?: boolean; default?: unknown }>
  returns: string
  description: string
  example: string
}>> = {
  WooCommerce: [
    {
      name: 'Products',
      parameters: [{ name: 'limit', type: 'Int', default: 10 }],
      returns: 'products.nodes',
      description: 'Fetch WooCommerce products',
      example: 'useLazyProducts({ limit: 10 })'
    },
    {
      name: 'ProductBySlug',
      parameters: [{ name: 'slug', type: 'String', required: true }],
      returns: 'product',
      description: 'Fetch a single product by slug',
      example: "useLazyProductBySlug({ slug: 'my-product' })"
    }
  ],
  ACF: [
    {
      name: 'AcfOptions',
      parameters: [],
      returns: 'acfOptions',
      description: 'Fetch ACF Options page fields',
      example: 'useLazyAcfOptions()'
    }
  ],
  Polylang: [
    {
      name: 'Languages',
      parameters: [],
      returns: 'languages',
      description: 'Fetch available languages',
      example: 'useLazyLanguages()'
    }
  ]
}

interface SchemaType {
  name: string
  kind: string
  description?: string
  fields?: Array<{
    name: string
    type: { name: string; kind: string }
  }>
}

interface IntrospectionResult {
  __schema: {
    types: SchemaType[]
    queryType: { name: string }
  }
}

/**
 * Detect plugins from GraphQL schema types
 */
function detectPlugins(types: SchemaType[]): string[] {
  const plugins: string[] = []
  const typeNames = types.map(t => t.name)

  // WooCommerce detection
  if (typeNames.some(n => n.includes('Product') || n.includes('WooCommerce'))) {
    plugins.push('WooCommerce')
  }

  // ACF detection
  if (typeNames.some(n => n.includes('Acf') || n.includes('FieldGroup'))) {
    plugins.push('ACF')
  }

  // Polylang detection
  if (typeNames.some(n => n.includes('Language') && n !== 'LanguageCodeEnum')) {
    plugins.push('Polylang')
  }

  // WPML detection
  if (typeNames.some(n => n.includes('Wpml'))) {
    plugins.push('WPML')
  }

  // Yoast SEO detection
  if (typeNames.some(n => n.includes('SEO') || n.includes('Yoast'))) {
    plugins.push('YoastSEO')
  }

  // Gravity Forms detection
  if (typeNames.some(n => n.includes('GravityForms') || n.includes('GfForm'))) {
    plugins.push('GravityForms')
  }

  return plugins
}

/**
 * Get available root query fields from schema
 */
function getQueryFields(types: SchemaType[]): string[] {
  const queryType = types.find(t => t.name === 'RootQuery')
  if (!queryType?.fields) return []
  return queryType.fields.map(f => f.name)
}

export default defineMcpTool({
  description: `List all available WPNuxt composables for the connected WordPress site.

This tool introspects the WordPress GraphQL schema to determine:
1. Which default WPNuxt queries/composables are available
2. Which plugins are detected (WooCommerce, ACF, etc.)
3. What additional queries could be created

Use this tool BEFORE generating code to know exactly which composables exist.

Composable naming convention:
- use{QueryName} - synchronous, blocking
- useAsync{QueryName} - async with Suspense
- useLazy{QueryName} - lazy loading, recommended for pages`,

  inputSchema: {
    includeExamples: z.boolean().optional().describe('Include usage examples (default: true)'),
    includePluginSuggestions: z.boolean().optional().describe('Include suggested queries for detected plugins (default: true)')
  },

  async handler({ includeExamples = true, includePluginSuggestions = true }) {
    // Introspect the GraphQL schema
    const result = await executeGraphQL<IntrospectionResult>(INTROSPECTION_QUERY)

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const types = result.data?.__schema.types ?? []
    const queryFields = getQueryFields(types)
    const detectedPlugins = detectPlugins(types)

    // Build composables list
    const composables = DEFAULT_QUERIES.map(q => ({
      name: q.name,
      composables: {
        sync: `use${q.name}`,
        async: `useAsync${q.name}`,
        lazy: `useLazy${q.name}`
      },
      parameters: q.parameters,
      returns: q.returns,
      description: q.description,
      ...(includeExamples && { example: q.example })
    }))

    // Check which queries are actually supported by the schema
    const supportedQueries = composables.filter(c => {
      // Map composable names to expected query field names
      const queryFieldMappings: Record<string, string[]> = {
        Menu: ['menu', 'menus'],
        NodeByUri: ['nodeByUri'],
        Posts: ['posts'],
        PostByUri: ['nodeByUri'],
        PostById: ['post'],
        PostsByCategoryName: ['posts'],
        PostsByCategoryId: ['posts'],
        Pages: ['pages'],
        PageByUri: ['nodeByUri'],
        PageById: ['page'],
        GeneralSettings: ['generalSettings'],
        Viewer: ['viewer'],
        Revisions: ['revisions']
      }

      const expectedFields = queryFieldMappings[c.name] || []
      return expectedFields.some(f => queryFields.includes(f))
    })

    // Build plugin suggestions
    const pluginSuggestions = includePluginSuggestions
      ? detectedPlugins.flatMap(plugin => {
          const queries = PLUGIN_QUERIES[plugin] || []
          return queries.map(q => ({
            plugin,
            name: q.name,
            composables: {
              sync: `use${q.name}`,
              async: `useAsync${q.name}`,
              lazy: `useLazy${q.name}`
            },
            description: q.description,
            note: 'Requires custom query in extend/queries/',
            ...(includeExamples && { example: q.example })
          }))
        })
      : []

    return jsonResult({
      summary: {
        totalComposables: supportedQueries.length * 3, // sync, async, lazy variants
        detectedPlugins,
        queryFieldsAvailable: queryFields.length
      },

      composables: supportedQueries,

      variants: {
        description: 'Each query generates 3 composable variants:',
        sync: 'use{Name} - Synchronous, blocks rendering',
        async: 'useAsync{Name} - Works with Suspense',
        lazy: 'useLazy{Name} - Returns { data, pending, error }, recommended for pages'
      },

      ...(pluginSuggestions.length > 0 && {
        pluginSuggestions: {
          description: 'Additional queries you could create for detected plugins:',
          suggestions: pluginSuggestions
        }
      }),

      usage: {
        note: 'Always use the lazy variant (useLazy*) in page components',
        examples: [
          "const { data: menu } = await useLazyMenu({ name: 'main' })",
          "const { data: posts } = await useLazyPosts({ limit: 10 })",
          "const { data: node } = await useLazyNodeByUri({ uri: route.path })"
        ]
      }
    })
  }
})
