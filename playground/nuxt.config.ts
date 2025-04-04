export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2025-04-03',

  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com'
  }
})
