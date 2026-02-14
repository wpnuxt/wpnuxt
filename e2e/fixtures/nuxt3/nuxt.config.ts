export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],

  compatibilityDate: '2024-11-01',

  wpNuxt: {
    wordpressUrl: process.env.WPNUXT_WORDPRESS_URL || 'http://localhost:8000',
    downloadSchema: true,
    debug: process.env.DEBUG === 'true'
  }
})
