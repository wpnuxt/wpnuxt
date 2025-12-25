/**
 * Blocks Playground
 *
 * Demonstrates the @wpnuxt/blocks package for rendering WordPress Gutenberg blocks
 * as individual Vue components. Uses <BlockRenderer :node="node" /> to render
 * structured editorBlocks data.
 *
 * Key features:
 * - Each block type gets its own Vue component (CoreParagraph, CoreHeading, etc.)
 * - Custom components can override defaults by placing them in components/blocks/
 * - NuxtImg integration for optimized image loading
 * - Nuxt UI integration when available (e.g., CoreButton uses UButton)
 *
 * Best for: Sites needing custom rendering per block type, lazy-loading images,
 * interactive blocks, or fine-grained control over block presentation.
 */
const IS_DEV = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  modules: [
    '@wpnuxt/core',
    '@wpnuxt/blocks', // Gutenberg block components
    '@nuxt/ui' // Optional: enables enhanced components like UButton for CoreButton
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-12-25',

  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    debug: IS_DEV,
    downloadSchema: true
  },

  wpNuxtBlocks: {
    imageDomains: ['wordpress.wpnuxt.com']
  }
})
