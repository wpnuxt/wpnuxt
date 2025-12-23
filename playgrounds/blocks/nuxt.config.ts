const IS_DEV = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  modules: [
    '@wpnuxt/core',
    '@wpnuxt/blocks',
    '@nuxt/ui'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-12-23',

  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    debug: IS_DEV,
    downloadSchema: true
  },

  wpNuxtBlocks: {
    imageDomains: ['wordpress.wpnuxt.com']
  }
})
