export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],

  compatibilityDate: '2024-07-01',

  wpNuxt: {
    wordpressUrl: process.env.WPNUXT_WORDPRESS_URL || 'http://localhost:8009',
    downloadSchema: true,
    debug: process.env.DEBUG === 'true'
  }
})
