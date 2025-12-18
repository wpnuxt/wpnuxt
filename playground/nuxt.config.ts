export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '../src/module'
  ],

  devtools: { enabled: process.env.NODE_ENV === 'development' },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/wp-content/**': { proxy: { to: 'http://localhost:4000/wp-content/**' } }
  },

  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2025-12-18',

  // @ts-expect-error - eslint config is provided by @nuxt/eslint module
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    },
    checker: {
      lintOnStart: true,
      fix: true
    }
  },

  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    frontendUrl: 'https://demo.wpnuxt.com',
    enableCache: true,
    staging: false,
    logLevel: 3,
    downloadSchema: true,
    composablesPrefix: 'use'
  }
})
