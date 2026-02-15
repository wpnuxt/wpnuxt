export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-01',

  wpNuxt: {
    wordpressUrl: process.env.WPNUXT_WORDPRESS_URL || 'http://localhost:8009',
    downloadSchema: true,
    debug: process.env.DEBUG === 'true'
  }
})
