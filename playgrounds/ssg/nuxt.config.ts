/**
 * SSG Playground
 *
 * Minimal setup demonstrating static site generation with WPNuxt.
 * Deploys to Vercel as a fully static site.
 */
const IS_CI = process.env.CI === 'true'
const IS_VERCEL = !!process.env.VERCEL

const WORDPRESS_URL = 'https://wordpress.wpnuxt.com'
const GRAPHQL_ENDPOINT = '/graphql'

export default defineNuxtConfig({
  modules: [
    '@wpnuxt/core',
    '@nuxt/image',
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-01-18',

  nitro: {
    preset: 'static',
    prerender: {
      concurrency: 10,
      interval: 1000,
      failOnError: false,
      routes: ['/']
    }
  },

  hooks: {
    async 'prerender:routes'(ctx) {
      // Fetch routes on Vercel or local builds, skip in CI (GitHub Actions)
      if (IS_VERCEL || !IS_CI) {
        await fetchWordPressRoutes(ctx.routes)
      }
    }
  },

  image: {
    domains: ['wordpress.wpnuxt.com']
  },

  wpNuxt: {
    wordpressUrl: WORDPRESS_URL,
    downloadSchema: !IS_CI
  }
})

async function fetchWordPressRoutes(routes: Set<string>) {
  console.log('[wpnuxt] Fetching WordPress routes for prerendering...')

  try {
    const response = await fetch(`${WORDPRESS_URL}${GRAPHQL_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query AllContentForPrerender {
            posts(first: 100) { nodes { uri } }
            pages(first: 100) { nodes { uri } }
          }
        `
      })
    })

    const data = await response.json() as {
      data?: {
        posts?: { nodes: Array<{ uri: string }> }
        pages?: { nodes: Array<{ uri: string }> }
      }
    }

    const posts = data.data?.posts?.nodes || []
    const pages = data.data?.pages?.nodes || []

    for (const post of posts) {
      if (post.uri) routes.add(post.uri)
    }
    for (const page of pages) {
      if (page.uri) routes.add(page.uri)
    }

    console.log(`[wpnuxt] Added ${posts.length} posts and ${pages.length} pages`)
  } catch (error) {
    console.warn('[wpnuxt] Failed to fetch WordPress routes:', error)
  }
}
