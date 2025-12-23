import { z } from 'zod'
import { executeGraphQL, CONTENT_TYPES_QUERY, TAXONOMIES_QUERY } from '../../utils/graphql'

interface ContentType {
  name: string
  graphqlSingleName: string
  graphqlPluralName: string
  hierarchical: boolean
}

interface Taxonomy {
  name: string
  graphqlSingleName: string
  graphqlPluralName: string
  hierarchical: boolean
  connectedContentTypes: { nodes: Array<{ name: string }> }
}

/**
 * Generate a GraphQL query for a content type.
 * Uses interface fragments (NodeWithTitle, NodeWithContentEditor, etc.) which
 * safely handle types that don't implement all interfaces.
 */
function generateQueryForContentType(
  ct: ContentType,
  taxonomies: Taxonomy[]
): string {
  const singular = ct.graphqlSingleName
  const plural = ct.graphqlPluralName
  const singularCapitalized = singular.charAt(0).toUpperCase() + singular.slice(1)
  const pluralCapitalized = plural.charAt(0).toUpperCase() + plural.slice(1)

  // Find taxonomies connected to this content type
  const connectedTaxonomies = taxonomies.filter(tax =>
    tax.connectedContentTypes.nodes.some(ctn => ctn.name === ct.name)
  )

  const taxonomyFields = connectedTaxonomies.map(tax =>
    `      ${tax.graphqlPluralName} {
        nodes {
          id
          name
          slug
        }
      }`
  ).join('\n')

  // Interface fragments - these safely handle types that don't implement them
  const listFragments = `      ... on NodeWithTitle { title }
      ... on NodeWithExcerpt { excerpt }
      ... on NodeWithFeaturedImage {
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }`

  const singleFragments = `      ... on NodeWithTitle { title }
      ... on NodeWithContentEditor { content }
      ... on NodeWithFeaturedImage {
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }`

  // Generate list query
  const listQuery = `query ${pluralCapitalized}($first: Int = 10, $after: String) {
  ${plural}(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      databaseId
      slug
      uri
      date
${listFragments}
${taxonomyFields}
    }
  }
}`

  // Generate single query by URI
  const singleQuery = `query ${singularCapitalized}ByUri($uri: ID!) {
  ${singular}(id: $uri, idType: URI) {
    id
    databaseId
    slug
    uri
    date
${singleFragments}
${taxonomyFields}
  }
}`

  // Generate by URI query using nodeByUri (works for all content types)
  const byNodeUriQuery = `query ${singularCapitalized}ByNodeUri($uri: String!) {
  nodeByUri(uri: $uri) {
    ... on ${singularCapitalized} {
      id
      databaseId
      slug
      uri
      date
${singleFragments}
${taxonomyFields}
    }
  }
}`

  return `# ${pluralCapitalized} Queries
# Generated for content type: ${ct.name}
# Place in: extend/queries/${pluralCapitalized}.gql

# List ${plural} with pagination
${listQuery}

# Get single ${singular} by URI
${singleQuery}

# Get single ${singular} via nodeByUri (useful for catch-all routes)
${byNodeUriQuery}`
}

function generateTaxonomyQuery(tax: Taxonomy): string {
  const singular = tax.graphqlSingleName
  const plural = tax.graphqlPluralName
  const singularCapitalized = singular.charAt(0).toUpperCase() + singular.slice(1)
  const pluralCapitalized = plural.charAt(0).toUpperCase() + plural.slice(1)

  const listQuery = `query ${pluralCapitalized} {
  ${plural} {
    nodes {
      id
      databaseId
      name
      slug
      description
      count
${tax.hierarchical ? '      parentId' : ''}
    }
  }
}`

  const singleQuery = `query ${singularCapitalized}BySlug($slug: ID!) {
  ${singular}(id: $slug, idType: SLUG) {
    id
    databaseId
    name
    slug
    description
    count
  }
}`

  return `# ${pluralCapitalized} Queries
# Generated for taxonomy: ${tax.name}
# Place in: extend/queries/${pluralCapitalized}.gql

# List all ${plural}
${listQuery}

# Get single ${singular} by slug
${singleQuery}`
}

export default defineMcpTool({
  description: `Generate GraphQL queries for WordPress content types and taxonomies.

Creates optimized queries following WPNuxt patterns with:
- Pagination support for list queries
- Interface fragments for safe field access
- Connected taxonomy fields

After generating, validate queries using nuxt-graphql-middleware's schema-validate-document tool.`,

  inputSchema: {
    includeContentTypes: z.boolean().optional().describe('Include queries for content types (default: true)'),
    includeTaxonomies: z.boolean().optional().describe('Include queries for taxonomies (default: true)'),
    contentTypes: z.array(z.string()).optional().describe('Specific content types to generate queries for (default: all)')
  },

  async handler({ includeContentTypes = true, includeTaxonomies = true, contentTypes: filterContentTypes }) {
    // Fetch content types and taxonomies from WordPress
    const [ctResult, taxResult] = await Promise.all([
      executeGraphQL<{ contentTypes: { nodes: ContentType[] } }>(CONTENT_TYPES_QUERY),
      executeGraphQL<{ taxonomies: { nodes: Taxonomy[] } }>(TAXONOMIES_QUERY)
    ])

    if (ctResult.errors) {
      return textResult(`GraphQL Error: ${ctResult.errors.map(e => e.message).join(', ')}`)
    }

    const allContentTypes = ctResult.data?.contentTypes.nodes ?? []
    const allTaxonomies = taxResult.data?.taxonomies.nodes ?? []

    // Filter content types if specified
    let contentTypesToGenerate = allContentTypes
    if (filterContentTypes && filterContentTypes.length > 0) {
      contentTypesToGenerate = allContentTypes.filter(ct =>
        filterContentTypes.includes(ct.name) || filterContentTypes.includes(ct.graphqlSingleName)
      )
    }

    const generatedQueries: Array<{ name: string, type: string, content: string }> = []

    // Generate content type queries
    if (includeContentTypes) {
      for (const ct of contentTypesToGenerate) {
        generatedQueries.push({
          name: ct.graphqlPluralName,
          type: 'contentType',
          content: generateQueryForContentType(ct, allTaxonomies)
        })
      }
    }

    // Generate taxonomy queries
    if (includeTaxonomies) {
      for (const tax of allTaxonomies) {
        generatedQueries.push({
          name: tax.graphqlPluralName,
          type: 'taxonomy',
          content: generateTaxonomyQuery(tax)
        })
      }
    }

    // Combine all queries into a single output
    const fullOutput = generatedQueries.map(q => q.content).join('\n\n---\n\n')

    return jsonResult({
      summary: {
        contentTypeQueries: generatedQueries.filter(q => q.type === 'contentType').length,
        taxonomyQueries: generatedQueries.filter(q => q.type === 'taxonomy').length,
        totalQueries: generatedQueries.length
      },

      instructions: [
        'Place these queries in your project\'s extend/queries/ directory',
        'WPNuxt will automatically generate typed composables for each query',
        'Run `pnpm run dev:prepare` to regenerate composables after adding queries'
      ],

      validation: {
        note: 'Validate queries using nuxt-graphql-middleware schema-validate-document tool',
        tool: 'schema-validate-document'
      },

      queries: generatedQueries.map(q => ({
        name: q.name,
        type: q.type,
        suggestedFilename: `${q.name.charAt(0).toUpperCase() + q.name.slice(1)}.gql`
      })),

      generatedCode: fullOutput
    })
  }
})
