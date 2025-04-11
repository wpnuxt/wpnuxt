export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/fonts'],

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2025-04-10',

  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com'
  }
})
