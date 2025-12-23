export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-12-23',

  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com'
  }
})
