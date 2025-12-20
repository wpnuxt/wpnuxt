/**
 * GraphQL utility functions for WordPress interaction
 */

export interface GraphQLResponse<T = unknown> {
  data?: T
  errors?: Array<{ message: string }>
}

/**
 * Get WordPress configuration from request headers or environment variables.
 * Headers take precedence, allowing each MCP user to connect to their own WordPress instance.
 *
 * Supported headers:
 * - X-WordPress-URL: The WordPress site URL (required if not set via env)
 * - X-WordPress-App-User: Optional application username for authenticated requests
 * - X-WordPress-App-Password: Optional application password for authenticated requests
 */
function getWordPressConfig() {
  const event = useEvent()
  const runtimeConfig = useRuntimeConfig()

  // Headers take precedence over environment variables
  const wordpressUrl = getHeader(event, 'x-wordpress-url') || runtimeConfig.wordpressUrl
  const appUser = getHeader(event, 'x-wordpress-app-user') || runtimeConfig.wordpressAppUser
  const appPassword = getHeader(event, 'x-wordpress-app-password') || runtimeConfig.wordpressAppPassword

  return {
    wordpressUrl,
    appUser,
    appPassword
  }
}

/**
 * Execute a GraphQL query against the WordPress endpoint
 */
export async function executeGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const config = getWordPressConfig()

  if (!config.wordpressUrl) {
    throw new Error('WordPress URL not configured. Set X-WordPress-URL header or NUXT_WORDPRESS_URL environment variable.')
  }

  const endpoint = `${config.wordpressUrl}/graphql`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Add authentication if configured
  if (config.appUser && config.appPassword) {
    const credentials = Buffer.from(
      `${config.appUser}:${config.appPassword}`
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

/**
 * Query to list all taxonomies
 */
export const TAXONOMIES_QUERY = `
  query Taxonomies {
    taxonomies {
      nodes {
        name
        graphqlSingleName
        graphqlPluralName
        description
        hierarchical
        showInGraphql
        connectedContentTypes {
          nodes {
            name
          }
        }
      }
    }
  }
`

/**
 * Query to get general site settings
 */
export const SITE_SETTINGS_QUERY = `
  query SiteSettings {
    generalSettings {
      title
      description
      url
      language
      timezone
      dateFormat
      timeFormat
    }
    readingSettings {
      postsPerPage
      showOnFront
      pageOnFront
      pageForPosts
    }
    discussionSettings {
      defaultCommentStatus
    }
  }
`

/**
 * Query to sample content with Gutenberg blocks
 */
export const SAMPLE_CONTENT_QUERY = `
  query SampleContent($contentType: ContentTypeEnum!, $first: Int = 5) {
    contentNodes(where: { contentTypes: [$contentType] }, first: $first) {
      nodes {
        ... on NodeWithTitle {
          title
        }
        ... on ContentNode {
          id
          databaseId
          uri
          contentTypeName
          date
        }
        ... on NodeWithContentEditor {
          content(format: RAW)
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
      }
    }
  }
`

/**
 * Query to detect plugins via schema introspection
 * We detect plugins by checking for their specific GraphQL types
 */
export const PLUGIN_DETECTION_QUERY = `
  query PluginDetection {
    __schema {
      types {
        name
        kind
        description
      }
    }
  }
`

/**
 * Query to fetch menus with menu items
 */
export const MENUS_QUERY = `
  query Menus {
    menus {
      nodes {
        id
        databaseId
        name
        slug
        locations
        menuItems(first: 100) {
          nodes {
            id
            databaseId
            parentId
            label
            url
            path
            target
            cssClasses
            childItems {
              nodes {
                id
                parentId
                label
                url
                path
                target
                cssClasses
              }
            }
          }
        }
      }
    }
  }
`
