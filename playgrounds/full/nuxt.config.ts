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
    prerender: {
      concurrency: 10,
      interval: 1000,
      failOnError: false,
      autoSubfolderIndex: false,
      routes: IS_DEV ? [] : ['/', '/composables', '/login', '/profile', '/query-options']
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
    wordpressUrl: 'https://wordpress.wpnuxt.com',
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
