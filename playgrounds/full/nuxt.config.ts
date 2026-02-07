/**
 * Full Playground
 *
 * Demonstrates WPNuxt with @nuxt/ui for beautiful content rendering.
 * Uses Tailwind Typography (prose classes) for HTML content from WordPress
 * and BlockRenderer for structured Gutenberg blocks.
 *
 * Best for: Content sites that want great styling out of the box without
 * needing custom control over individual Gutenberg blocks.
 */
const IS_DEV = process.env.NODE_ENV === 'development'
const IS_CI = process.env.CI === 'true'

const WORDPRESS_URL = 'https://wordpress.wpnuxt.com'

export default defineNuxtConfig({
  modules: [
    '@wpnuxt/core',
    '@wpnuxt/auth',
    '@wpnuxt/blocks',
    '@nuxt/image',
    '@nuxt/ui'
  ],

  devtools: { enabled: true },

  css: [
    '~/assets/css/main.css',
    'vue-json-pretty/lib/styles.css'
  ],

  compatibilityDate: '2026-01-18',

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
