export default defineNuxtConfig({
  extends: [
    '@nuxt/ui-pro'
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '../src/module'
  ],

  devtools: { enabled: true },

  ui: {
    icons: ['heroicons', 'uil', 'mdi']
  },

  routeRules: {
    '/wp-content/**': { proxy: { to: 'http://localhost:10004/wp-content/**' } }
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

  image: {
    provider: 'twicpics',
    domains: ['wordpress.wpnuxt.com'],
    twicpics: {
      baseURL: 'https://vernaillen.twic.pics/wpnuxt-demo'
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
