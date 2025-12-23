import pkg from './package.json'

export default defineNuxtConfig({

  modules: ['@nuxtjs/mcp-toolkit'],

  devtools: { enabled: true },

  // Runtime config for WordPress connection
  runtimeConfig: {
    // WordPress GraphQL endpoint (set via NUXT_WORDPRESS_URL env var)
    wordpressUrl: '',
    // Optional: WordPress Application Password for authenticated requests
    wordpressAppUser: '',
    wordpressAppPassword: '',
    // Package version (used by wpnuxt_init to set @wpnuxt/core dependency)
    wpnuxtVersion: pkg.version
  },

  // Enable async context for Nitro request handling
  experimental: {
    asyncContext: true
  },
  compatibilityDate: '2025-12-23'
})
