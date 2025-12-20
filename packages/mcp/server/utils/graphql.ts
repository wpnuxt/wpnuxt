/**
 * GraphQL utility functions for WordPress interaction
 */

export interface GraphQLResponse<T = unknown> {
  data?: T
  errors?: Array<{ message: string }>
}

/**
 * Execute a GraphQL query against the WordPress endpoint
 */
export async function executeGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const config = useRuntimeConfig()

  if (!config.wordpressUrl) {
    throw new Error('WordPress URL not configured. Set NUXT_WORDPRESS_URL environment variable.')
  }

  const endpoint = `${config.wordpressUrl}/graphql`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Add authentication if configured
  if (config.wordpressAppUser && config.wordpressAppPassword) {
    const credentials = Buffer.from(
      `${config.wordpressAppUser}:${config.wordpressAppPassword}`
    ).toString('base64')
    headers['Authorization'] = `Basic ${credentials}`
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Introspection query to get the full schema
 */
export const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
        description
        fields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
          args {
            name
            description
            type {
              name
              kind
            }
          }
        }
      }
      queryType { name }
      mutationType { name }
    }
  }
`

/**
 * Query to list all content types (post types)
 */
export const CONTENT_TYPES_QUERY = `
  query ContentTypes {
    contentTypes {
      nodes {
        name
        graphqlSingleName
        graphqlPluralName
        description
        hasArchive
        hierarchical
      }
    }
  }
`

/**
 * Query to fetch posts
 */
export const POSTS_QUERY = `
  query Posts($first: Int = 10, $after: String) {
    posts(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        title
        slug
        date
        excerpt
        uri
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            name
          }
        }
      }
    }
  }
`

/**
 * Query to fetch pages
 */
export const PAGES_QUERY = `
  query Pages($first: Int = 10, $after: String) {
    pages(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        title
        slug
        date
        uri
        parentId
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`
