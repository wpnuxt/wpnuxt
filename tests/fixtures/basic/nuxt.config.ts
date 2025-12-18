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
  // @ts-expect-error - wpNuxt config is provided by wpnuxt module
  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    frontendUrl: 'https://demo.wpnuxt.com'
  }
})
