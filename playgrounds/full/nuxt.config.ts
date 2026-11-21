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

const WORDPRESS_URL = process.env.WPNUXT_WORDPRESS_URL || 'https://wordpress.wpnuxt.com'

export default defineNuxtConfig({
  modules: [
    '@wpnuxt/core',
    '@wpnuxt/auth',
    '@wpnuxt/blocks',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/sitemap',
    'nuxt-easy-lightbox'
  ],

  devtools: { enabled: true },

  css: [
    '~/assets/css/main.css',
    'vue-json-pretty/lib/styles.css'
  ],

  // Used by @nuxtjs/sitemap (canonical URL, sitemap title). Override with NUXT_SITE_URL / NUXT_SITE_NAME.
  site: {
    url: 'https://demo.wpnuxt.com',
    name: 'WPNuxt Demo'
  },

  compatibilityDate: '2026-08-27',

  // Disable error overlay due to bug with path.join() on errors without path
  graphqlMiddleware: {
    errorOverlay: false
  },

  image: {
    domains: ['wordpress.wpnuxt.com']
  },

  wpNuxt: {
    wordpressUrl: WORDPRESS_URL,
    imageRelativePaths: true,
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
