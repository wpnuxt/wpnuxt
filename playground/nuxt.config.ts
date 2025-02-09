export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '../src/module'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: true
  },

  routeRules: {
    '/wp-content/**': { proxy: { to: 'http://localhost:4000/wp-content/**' } }
  },

  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2025-01-09',

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
    logLevel: 4,
    downloadSchema: true,
    composablesPrefix: 'use'
  }
})
