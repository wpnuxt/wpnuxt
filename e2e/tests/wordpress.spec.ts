import { test, expect } from '@playwright/test'

const wpUrl = process.env.WPNUXT_WORDPRESS_URL || 'http://localhost:8000'
const nuxtVersion = process.env.NUXT_VERSION || '4'

test.describe(`WPNuxt E2E Tests - Nuxt ${nuxtVersion}`, () => {
  test('WordPress GraphQL endpoint is accessible', async ({ request }) => {
    const response = await request.post(`${wpUrl}/graphql`, {
      data: {
        query: `
          query {
            posts(first: 1) {
              nodes {
                id
              }
            }
          }
        `
      }
    })

    expect(response.ok()).toBe(true)
    const body = await response.json()
    expect(body.data).toBeDefined()
    expect(body.data.posts).toBeDefined()
  })

  test('WPGraphQL returns posts', async ({ request }) => {
    const response = await request.post(`${wpUrl}/graphql`, {
      data: {
        query: `
          query {
            posts(first: 1) {
              nodes {
                id
                title
              }
            }
          }
        `
      }
    })

    expect(response.ok()).toBe(true)
    const body = await response.json()
    expect(body.data.posts.nodes).toBeDefined()
  })

  test('WPGraphQL returns pages', async ({ request }) => {
    const response = await request.post(`${wpUrl}/graphql`, {
      data: {
        query: `
          query {
            pages(first: 1) {
              nodes {
                id
                title
              }
            }
          }
        `
      }
    })

    expect(response.ok()).toBe(true)
    const body = await response.json()
    expect(body.data.pages.nodes).toBeDefined()
  })

  test('WPGraphQL generalSettings query works', async ({ request }) => {
    const response = await request.post(`${wpUrl}/graphql`, {
      data: {
        query: `
          query {
            generalSettings {
              title
              description
            }
          }
        `
      }
    })

    expect(response.ok()).toBe(true)
    const body = await response.json()
    expect(body.data.generalSettings).toBeDefined()
  })
})
