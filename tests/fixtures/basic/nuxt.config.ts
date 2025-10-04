import WPNuxtModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    WPNuxtModule
  ],
  runtimeConfig: {
    public: {
      myValue: 'original value'
    }
  },
  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    frontendUrl: 'https://demo.wpnuxt.com'
  }
})
