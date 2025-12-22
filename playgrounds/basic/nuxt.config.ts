export default defineNuxtConfig({
  modules: ['@wpnuxt/core'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-12-22',

  wpNuxt: {
    wordpressUrl: 'https://wordpress2.wpnuxt.com'
  }
})
