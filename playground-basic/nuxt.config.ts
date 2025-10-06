export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/fonts'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2025-10-05',

  wpNuxt: {
    wordpressUrl: 'https://wordpress2.wpnuxt.com'
  }
})
