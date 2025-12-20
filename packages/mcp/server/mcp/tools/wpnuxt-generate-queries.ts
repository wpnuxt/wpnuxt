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

function generateQueryForContentType(ct: ContentType, taxonomies: Taxonomy[]): string {
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
      ... on NodeWithTitle {
        title
      }
      ... on NodeWithExcerpt {
        excerpt
      }
      ... on NodeWithFeaturedImage {
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
${taxonomyFields}
    }
  }
}`

  // Generate single query
  const singleQuery = `query ${singularCapitalized}BySlug($slug: ID!) {
  ${singular}(id: $slug, idType: SLUG) {
    id
    databaseId
    slug
    uri
    date
    ... on NodeWithTitle {
      title
    }
    ... on NodeWithContentEditor {
      content
    }
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
    }
${taxonomyFields}
  }
}`

  // Generate by URI query (for catch-all routes)
  const byUriQuery = `query ${singularCapitalized}ByUri($uri: String!) {
  ${singular}(id: $uri, idType: URI) {
    id
    databaseId
    slug
    uri
    date
    ... on NodeWithTitle {
      title
    }
    ... on NodeWithContentEditor {
      content
    }
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
    }
${taxonomyFields}
  }
}`

  return `# ${pluralCapitalized} Queries
# Generated for content type: ${ct.name}
# Place in: queries/${pluralCapitalized}.gql

# List ${plural} with pagination
${listQuery}

# Get single ${singular} by slug
${singleQuery}

# Get single ${singular} by URI (useful for catch-all routes)
${byUriQuery}`
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
# Place in: queries/${pluralCapitalized}.gql

# List all ${plural}
${listQuery}

# Get single ${singular} by slug
${singleQuery}`
}

export default defineMcpTool({
  description: 'Generate GraphQL queries for WordPress content types and taxonomies. Creates optimized queries following WPNuxt patterns.',
  inputSchema: {
    includeContentTypes: z.boolean().optional().describe('Include queries for content types (default: true)'),
    includeTaxonomies: z.boolean().optional().describe('Include queries for taxonomies (default: true)'),
    contentTypes: z.array(z.string()).optional().describe('Specific content types to generate queries for (default: all)')
  },
  async handler({ includeContentTypes = true, includeTaxonomies = true, contentTypes: filterContentTypes }) {
    // Fetch content types and taxonomies
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
      queries: generatedQueries.map(q => ({
        name: q.name,
        type: q.type,
        suggestedFilename: `${q.name.charAt(0).toUpperCase() + q.name.slice(1)}.gql`
      })),
      generatedCode: fullOutput
    })
  }
})
