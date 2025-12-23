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

export default defineNuxtConfig({
  modules: [
    '@wpnuxt/core',
    '@nuxt/ui', // UI components and styling
    '@nuxtjs/mdc' // Renders HTML/Markdown content with beautiful typography
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-12-23',

  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    debug: IS_DEV,
    downloadSchema: IS_DEV
  }
})
