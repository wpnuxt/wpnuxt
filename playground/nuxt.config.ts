const IS_DEV = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
    '@nuxtjs/mdc'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2025-10-05',

  wpNuxt: {
    wordpressUrl: 'https://wordpress2.wpnuxt.com',
    debug: IS_DEV,
    downloadSchema: IS_DEV
  }
})
