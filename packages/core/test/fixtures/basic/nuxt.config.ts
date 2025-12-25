import wpNuxt from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    wpNuxt
  ],
  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    downloadSchema: true
  }
})
