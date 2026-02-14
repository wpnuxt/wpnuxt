import { test, expect } from '@playwright/test'

const wpUrl = process.env.WPNUXT_WORDPRESS_URL || 'http://localhost:8009'

// Helper to make GraphQL requests
async function graphqlRequest(request: Playwright['request'], query: string, variables = {}) {
  const response = await request.post(`${wpUrl}/graphql`, {
    data: { query, variables }
  })
  const body = await response.json()
  return { response, body }
}

test.describe('WPNuxt E2E Tests - WordPress', () => {
  test('WordPress GraphQL endpoint is accessible', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        posts(first: 1) {
          nodes { id }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data).toBeDefined()
    expect(body.data.posts).toBeDefined()
  })

  test('WPGraphQL returns posts', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        posts(first: 1) {
          nodes {
            id
            title
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.posts.nodes).toBeDefined()
  })

  test('WPGraphQL returns pages', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        pages(first: 1) {
          nodes {
            id
            title
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.pages.nodes).toBeDefined()
  })

  test('WPGraphQL generalSettings query works', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        generalSettings {
          title
          description
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.generalSettings).toBeDefined()
  })

  // === NEW TESTS ===

  test('WPGraphQL returns categories', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        categories(first: 5) {
          nodes {
            id
            name
            slug
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.categories).toBeDefined()
    expect(body.data.categories.nodes).toBeDefined()
  })

  test('WPGraphQL returns tags', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        tags(first: 5) {
          nodes {
            id
            name
            slug
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.tags).toBeDefined()
    expect(body.data.tags.nodes).toBeDefined()
  })

  test('WPGraphQL returns media items', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        mediaItems(first: 5) {
          nodes {
            id
            title
            sourceUrl
            mimeType
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.mediaItems).toBeDefined()
    expect(body.data.mediaItems.nodes).toBeDefined()
  })

  test('WPGraphQL returns users', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        users(first: 5) {
          nodes {
            id
            name
            username
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.users).toBeDefined()
    expect(body.data.users.nodes).toBeDefined()
  })

  test('WPGraphQL returns comments', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        comments(first: 5) {
          nodes {
            id
            content
            author {
              ... on User {
                name
              }
            }
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    // Comments may not exist in test data - check data exists first
    if (body.data?.comments) {
      expect(body.data.comments.nodes).toBeDefined()
    }
  })

  test('WPGraphQL supports pagination with first/after', async ({ request }) => {
    // First page
    const { response: res1, body: body1 } = await graphqlRequest(request, `
      query {
        posts(first: 2) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            title
          }
        }
      }
    `)

    expect(res1.ok()).toBe(true)
    expect(body1.data.posts.pageInfo).toBeDefined()

    // If there's a next page, try to fetch it
    if (body1.data.posts.pageInfo.hasNextPage) {
      const cursor = body1.data.posts.pageInfo.endCursor
      const { response: res2, body: _body2 } = await graphqlRequest(request, `
        query($cursor: String) {
          posts(first: 2, after: $cursor) {
            pageInfo {
              hasNextPage
            }
            nodes {
              id
              title
            }
          }
        }
      `, { cursor })

      expect(res2.ok()).toBe(true)
    }
  })

  test('WPGraphQL supports filtering with where clause', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        posts(first: 5, where: { status: PUBLISH }) {
          nodes {
            id
            title
            status
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.posts.nodes).toBeDefined()

    // Verify all returned posts are published
    for (const post of body.data.posts.nodes) {
      expect(post.status).toBe('publish')
    }
  })

  test('WPGraphQL supports sorting', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        posts(first: 3, where: { orderby: [{ field: DATE, order: DESC }] }) {
          nodes {
            id
            title
            date
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.posts.nodes).toBeDefined()

    // Verify descending order
    const posts = body.data.posts.nodes
    for (let i = 0; i < posts.length - 1; i++) {
      expect(new Date(posts[i].date) >= new Date(posts[i + 1].date)).toBe(true)
    }
  })

  test('WPGraphQL returns proper errors for invalid queries', async ({ request }) => {
    const response = await request.post(`${wpUrl}/graphql`, {
      data: {
        query: `
          query {
            nonexistentField {
              id
            }
          }
        `
      }
    })

    const body = await response.json()
    expect(response.ok()).toBe(true)
    // GraphQL should return errors (even with 200 status)
    expect(body.errors).toBeDefined()
    expect(body.errors.length).toBeGreaterThan(0)
  })

  test('WPGraphQL returns proper errors for invalid variable types', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query($first: String) {
        posts(first: $first) {
          nodes {
            id
          }
        }
      }
    `, { first: 'not-a-number' })

    expect(response.ok()).toBe(true)
    expect(body.errors).toBeDefined()
    expect(body.errors.length).toBeGreaterThan(0)
  })

  test('WPGraphQL supports introspection', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.__schema).toBeDefined()
    expect(body.data.__schema.types).toBeDefined()
  })

  test('WPGraphQL contentNode by URI', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        nodeByUri(uri: "/") {
          ... on ContentNode {
            id
            uri
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.nodeByUri).toBeDefined()
  })

  test('WPGraphQL returns posts with featured images', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        posts(first: 10) {
          nodes {
            id
            title
            featuredImage {
              node {
                id
                sourceUrl
                altText
              }
            }
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.posts.nodes).toBeDefined()

    // Find posts with a featured image (not all posts may have one)
    const postsWithFeaturedImage = body.data.posts.nodes.filter(
      (post: { featuredImage: { node: { id: string } | null } | null }) => post.featuredImage?.node?.id
    )

    if (postsWithFeaturedImage.length > 0) {
      const featuredImage = postsWithFeaturedImage[0].featuredImage.node
      expect(featuredImage.id).toBeDefined()
      expect(featuredImage.sourceUrl).toContain('http')
    }
  })

  test('WPGraphQL returns posts with author information', async ({ request }) => {
    const { response, body } = await graphqlRequest(request, `
      query {
        posts(first: 5) {
          nodes {
            id
            title
            authorDatabaseId
            author {
              node {
                id
                name
              }
            }
          }
        }
      }
    `)

    expect(response.ok()).toBe(true)
    expect(body.data.posts.nodes).toBeDefined()
    expect(body.data.posts.nodes.length).toBeGreaterThan(0)

    // Every post should have an authorDatabaseId
    for (const post of body.data.posts.nodes) {
      expect(post.authorDatabaseId).toBeDefined()
    }
  })

  test('WPGraphQL supports filtering posts by category', async ({ request }) => {
    // First get a category
    const { body: categoryBody } = await graphqlRequest(request, `
      query {
        categories(first: 1) {
          nodes {
            databaseId
            name
            slug
          }
        }
      }
    `)

    if (!categoryBody.data.categories.nodes.length) {
      return
    }

    const category = categoryBody.data.categories.nodes[0]

    // Filter posts by category using databaseId (Int)
    const { response, body } = await graphqlRequest(request, `
      query($categoryId: Int) {
        posts(first: 5, where: { categoryId: $categoryId }) {
          nodes {
            id
            title
            categories {
              nodes {
                databaseId
                name
              }
            }
          }
        }
      }
    `, { categoryId: category.databaseId })

    expect(response.ok()).toBe(true)
    expect(body.data.posts.nodes).toBeDefined()

    // Verify all returned posts have the specified category
    for (const post of body.data.posts.nodes) {
      const categoryDbIds = post.categories.nodes.map((c: { databaseId: number }) => c.databaseId)
      expect(categoryDbIds).toContain(category.databaseId)
    }
  })

  test('WPGraphQL supports querying post by slug', async ({ request }) => {
    // First get a post slug
    const { body: postBody } = await graphqlRequest(request, `
      query {
        posts(first: 1) {
          nodes {
            slug
          }
        }
      }
    `)

    if (!postBody.data.posts.nodes.length) {
      return
    }

    const slug = postBody.data.posts.nodes[0].slug

    // Query single post by slug
    const { response, body } = await graphqlRequest(request, `
      query($slug: ID!) {
        post(id: $slug, idType: SLUG) {
          id
          slug
        }
      }
    `, { slug })

    expect(response.ok()).toBe(true)
    expect(body.data.post).toBeDefined()
    expect(body.data.post.slug).toBe(slug)
  })

  test('WPGraphQL supports querying post by ID', async ({ request }) => {
    // First get a post ID
    const { body: postBody } = await graphqlRequest(request, `
      query {
        posts(first: 1) {
          nodes {
            id
          }
        }
      }
    `)

    if (!postBody.data.posts.nodes.length) {
      return
    }

    const postId = postBody.data.posts.nodes[0].id

    // Query single post by global ID
    const { response, body } = await graphqlRequest(request, `
      query($id: ID!) {
        post(id: $id) {
          id
        }
      }
    `, { id: postId })

    expect(response.ok()).toBe(true)
    expect(body.data.post).toBeDefined()
    expect(body.data.post.id).toBe(postId)
  })
})
