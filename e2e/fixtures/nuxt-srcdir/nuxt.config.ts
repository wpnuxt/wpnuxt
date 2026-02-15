export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],

  srcDir: 'src/',

  compatibilityDate: '2026-01-18',

  wpNuxt: {
    wordpressUrl: process.env.WPNUXT_WORDPRESS_URL || 'http://localhost:8009',
    downloadSchema: true,
    debug: process.env.DEBUG === 'true'
  }
})
