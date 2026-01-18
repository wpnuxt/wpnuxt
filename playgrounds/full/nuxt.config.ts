/**
 * Full Playground
 *
 * Demonstrates WPNuxt with @nuxt/ui and @nuxtjs/mdc for beautiful content rendering.
 * Uses MDC's <MDC :value="post.content" /> to render pre-rendered HTML from WordPress
 * with automatic typography and styling.
 *
 * Best for: Content sites that want great styling out of the box without
 * needing custom control over individual Gutenberg blocks.
 */
const IS_DEV = process.env.NODE_ENV === 'development'
const IS_CI = process.env.CI === 'true'
const IS_VERCEL_SSG = process.env.VERCEL_SSG === 'true'

const WORDPRESS_URL = 'https://wordpress.wpnuxt.com'
const GRAPHQL_ENDPOINT = '/graphql'

export default defineNuxtConfig({
  modules: [
    '@wpnuxt/core',
    '@wpnuxt/auth',
    '@wpnuxt/blocks',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/mdc'
  ],

  devtools: { enabled: true },

  css: [
    '~/assets/css/main.css',
    'vue-json-pretty/lib/styles.css'
  ],

  compatibilityDate: '2025-12-25',

  // Prerendering configuration for static site generation
  // Adjust concurrency and interval based on server capabilities
  nitro: {
    // Use vercel-static preset for SSG deployment on Vercel
    preset: IS_VERCEL_SSG ? 'vercel-static' : undefined,
    prerender: {
      concurrency: 10,
      interval: 1000,
      failOnError: false,
      routes: IS_DEV ? [] : ['/', '/composables/', '/login/', '/profile/', '/query-options/']
    }
  },

  hooks: {
    async 'prerender:routes'(ctx) {
      if (!IS_DEV && !IS_CI) {
        await fetchWordPressRoutes(ctx.routes)
      }
    }
  },

  // Disable error overlay due to bug with path.join() on errors without path
  graphqlMiddleware: {
    errorOverlay: false
  },

  image: {
    provider: 'twicpics',
    twicpics: {
      baseURL: 'https://vernaillen.twic.pics/wpnuxt-demo'
    }
  },

  wpNuxt: {
    wordpressUrl: WORDPRESS_URL,
    debug: IS_DEV,
    downloadSchema: !IS_CI // Use committed schema in CI (WordPress not accessible)
  },

  wpNuxtAuth: {
    providers: {
      password: { enabled: true }, // default
      headlessLogin: {
        enabled: true // Providers auto-discovered from WordPress
      }
    }
  },

  wpNuxtBlocks: {
    imageDomains: ['wordpress.wpnuxt.com']
  }
})

/**
 * Fetches all WordPress posts and pages and adds them to prerender routes
 */
async function fetchWordPressRoutes(routes: Set<string>) {
  console.log('[wpnuxt] Fetching WordPress routes for prerendering...')

  try {
    const response = await fetch(`${WORDPRESS_URL}${GRAPHQL_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query AllContentForPrerender {
            posts(first: 100) {
              nodes { uri }
            }
            pages(first: 100) {
              nodes { uri }
            }
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

    console.log(`[wpnuxt] Added ${posts.length} posts and ${pages.length} pages to prerender routes`)
  } catch (error) {
    console.warn('[wpnuxt] Failed to fetch WordPress routes:', error)
  }
}
