import { executeGraphQL, PLUGIN_DETECTION_QUERY } from '../../utils/graphql'

// Known plugin signatures in the GraphQL schema
const PLUGIN_SIGNATURES: Record<string, { types: string[], description: string }> = {
  'Advanced Custom Fields (ACF)': {
    types: ['AcfFieldGroup', 'ACF', 'AcfOptionsPage'],
    description: 'Custom fields plugin - adds flexible content fields'
  },
  'WooCommerce': {
    types: ['Product', 'ProductCategory', 'Cart', 'Order', 'Customer', 'WooCommerce'],
    description: 'E-commerce plugin - products, cart, checkout'
  },
  'Yoast SEO': {
    types: ['SEO', 'PostTypeSEO', 'SEORedirect'],
    description: 'SEO plugin - meta tags, sitemaps, breadcrumbs'
  },
  'WPGraphQL for ACF': {
    types: ['AcfFieldGroup', 'FlexibleContent', 'Repeater'],
    description: 'Exposes ACF fields to GraphQL'
  },
  'Gravity Forms': {
    types: ['GfForm', 'GfEntry', 'GravityFormsForm'],
    description: 'Form builder plugin'
  },
  'Polylang': {
    types: ['Language', 'Translation', 'PolylangLanguage'],
    description: 'Multilingual plugin'
  },
  'WPML': {
    types: ['WpmlLanguage', 'TranslatedPost'],
    description: 'Multilingual plugin'
  },
  'WPGraphQL JWT Authentication': {
    types: ['AuthToken', 'JwtAuthToken', 'RefreshToken'],
    description: 'JWT-based authentication'
  },
  'WPGraphQL for Custom Post Type UI': {
    types: ['CptUi'],
    description: 'Custom post types UI integration'
  },
  'FacetWP': {
    types: ['Facet', 'FacetWP'],
    description: 'Faceted search and filtering'
  },
  'WPGraphQL Content Blocks': {
    types: ['EditorBlock', 'BlockAttributes', 'CoreParagraphBlock'],
    description: 'Gutenberg blocks as structured data'
  },
  'WPGraphQL Headless Login': {
    types: ['LoginPayload', 'LoginInput'],
    description: 'Headless authentication'
  }
}

export default defineMcpTool({
  description: 'Detect WordPress plugins that extend GraphQL by analyzing the schema. Identifies ACF, WooCommerce, Yoast SEO, and other common plugins.',
  async handler() {
    const result = await executeGraphQL<{
      __schema: {
        types: Array<{
          name: string
          kind: string
          description?: string
        }>
      }
    }>(PLUGIN_DETECTION_QUERY)

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const schemaTypes = result.data?.__schema.types ?? []
    const typeNames = new Set(schemaTypes.map(t => t.name))

    // Detect plugins
    const detectedPlugins: Array<{
      name: string
      description: string
      confidence: 'high' | 'medium' | 'low'
      matchedTypes: string[]
    }> = []

    for (const [pluginName, signature] of Object.entries(PLUGIN_SIGNATURES)) {
      const matchedTypes = signature.types.filter(t => typeNames.has(t))
      if (matchedTypes.length > 0) {
        const confidence = matchedTypes.length >= 2
          ? 'high'
          : matchedTypes.length === 1
            ? 'medium'
            : 'low'

        detectedPlugins.push({
          name: pluginName,
          description: signature.description,
          confidence,
          matchedTypes
        })
      }
    }

    // Sort by confidence
    detectedPlugins.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.confidence] - order[b.confidence]
    })

    // Identify custom types (not WordPress core or detected plugins)
    const coreTypes = new Set([
      'Post', 'Page', 'MediaItem', 'Category', 'Tag', 'Comment', 'User',
      'Menu', 'MenuItem', 'ContentNode', 'TermNode', 'RootQuery',
      'String', 'Int', 'Float', 'Boolean', 'ID', 'DateTime'
    ])
    const detectedTypes = new Set(detectedPlugins.flatMap(p => p.matchedTypes))

    const customTypes = schemaTypes
      .filter(t =>
        !t.name.startsWith('__')
        && t.kind === 'OBJECT'
        && !coreTypes.has(t.name)
        && !detectedTypes.has(t.name)
        && !t.name.includes('Connection')
        && !t.name.includes('Edge')
        && !t.name.includes('PageInfo')
      )
      .map(t => ({
        name: t.name,
        description: t.description
      }))
      .slice(0, 20) // Limit to first 20

    return jsonResult({
      summary: {
        detectedPlugins: detectedPlugins.length,
        highConfidence: detectedPlugins.filter(p => p.confidence === 'high').length,
        totalSchemaTypes: schemaTypes.length,
        customTypesFound: customTypes.length
      },
      plugins: detectedPlugins,
      recommendations: detectedPlugins.map((plugin) => {
        switch (plugin.name) {
          case 'Advanced Custom Fields (ACF)':
            return {
              plugin: plugin.name,
              recommendation: 'Use ACF fields in your GraphQL queries. Fields are typically available on content types.'
            }
          case 'WooCommerce':
            return {
              plugin: plugin.name,
              recommendation: 'Consider using @wpnuxt/woo module for WooCommerce integration. Query products, cart, and orders via GraphQL.'
            }
          case 'Yoast SEO':
            return {
              plugin: plugin.name,
              recommendation: 'SEO meta data available via the seo field on posts/pages. Use with useSeoMeta() in Nuxt.'
            }
          case 'Polylang':
          case 'WPML':
            return {
              plugin: plugin.name,
              recommendation: 'Configure i18n in Nuxt and use language-aware GraphQL queries.'
            }
          default:
            return {
              plugin: plugin.name,
              recommendation: `Plugin detected. Check WPGraphQL documentation for ${plugin.name} integration.`
            }
        }
      }),
      customTypes: customTypes.length > 0 ? customTypes : undefined
    })
  }
})
