export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],
  
  compatibilityDate: '2026-01-18',
  
  wpNuxt: {
    wordpressUrl: process.env.WPNUXT_WORDPRESS_URL || 'http://localhost:8000',
    downloadSchema: true,
    debug: process.env.DEBUG === 'true'
  }
})
