export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui-pro',
    '@nuxtjs/mdc',
    'nuxt-time'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2025-04-07',

  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com'
  }
})
