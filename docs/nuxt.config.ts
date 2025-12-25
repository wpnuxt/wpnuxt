export default defineNuxtConfig({
  extends: ['docus'],

  css: ['~/assets/css/main.css'],

  site: {
    name: 'WPNuxt',
    url: 'https://wpnuxt.com'
  },

  compatibilityDate: '2025-12-25',

  llms: {
    domain: 'https://wpnuxt.com'
  },

  pwa: {
    enabled: false
  }
})
