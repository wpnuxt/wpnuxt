export default defineNuxtConfig({

  modules: ['@nuxtjs/mcp-toolkit'],

  devtools: { enabled: true },

  // Runtime config for WordPress connection
  runtimeConfig: {
    // WordPress GraphQL endpoint (set via NUXT_WORDPRESS_URL env var)
    wordpressUrl: '',
    // Optional: WordPress Application Password for authenticated requests
    wordpressAppUser: '',
    wordpressAppPassword: ''
  },
  compatibilityDate: '2025-01-01'
})
