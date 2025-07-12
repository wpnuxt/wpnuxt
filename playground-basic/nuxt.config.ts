export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/fonts'],

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2025-07-12',

  wpNuxt: {
    wordpressUrl: 'https://wordpress2.wpnuxt.com'
  }
})
