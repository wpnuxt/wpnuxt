const IS_DEV = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  modules: [
    '@wpnuxt/core',
    '@nuxt/ui',
    '@nuxtjs/mdc'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-12-23',

  wpNuxt: {
    wordpressUrl: 'https://wordpress2.wpnuxt.com',
    debug: IS_DEV,
    downloadSchema: IS_DEV
  }
})
