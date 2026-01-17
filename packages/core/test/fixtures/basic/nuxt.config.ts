import wpNuxt from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    wpNuxt
  ],
  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    downloadSchema: false // Use committed schema.graphql (avoids network calls in CI)
  }
})
