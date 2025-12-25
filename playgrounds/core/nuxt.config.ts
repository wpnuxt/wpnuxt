/**
 * Core Playground
 *
 * Minimal setup with only @wpnuxt/core - no UI framework or content rendering library.
 * Good for testing core WPNuxt functionality (GraphQL queries, composables, etc.)
 * without any additional dependencies.
 */
export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-12-25',

  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    downloadSchema: true
  }
})
