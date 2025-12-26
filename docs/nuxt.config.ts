export default defineNuxtConfig({
  extends: ['docus'],

  modules: ['@nuxtjs/mcp-toolkit'],

  css: ['~/assets/css/main.css'],

  site: {
    name: 'WPNuxt',
    url: 'https://wpnuxt.com'
  },

  // Runtime config for MCP WordPress connection
  runtimeConfig: {
    // WordPress GraphQL endpoint (set via NUXT_WORDPRESS_URL env var)
    wordpressUrl: '',
    // Optional: WordPress Application Password for authenticated requests
    wordpressAppUser: '',
    wordpressAppPassword: '',
    // Package version (used by wpnuxt_init to set @wpnuxt/core dependency)
    wpnuxtVersion: '2.0.0'
  },

  // Hybrid rendering: static docs, dynamic MCP
  routeRules: {
    // MCP endpoints need server-side rendering
    '/mcp/**': { ssr: true },
    '/sse': { ssr: true }
  },

  // Enable async context for Nitro request handling
  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2025-12-26',

  llms: {
    domain: 'https://wpnuxt.com'
  },

  mcp: {
    name: 'WPNuxt',
    browserRedirect: '/ai/'
  },

  pwa: {
    enabled: false
  }
})
