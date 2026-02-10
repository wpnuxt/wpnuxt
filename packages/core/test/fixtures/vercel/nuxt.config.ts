import wpNuxt from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    wpNuxt
  ],
  nitro: {
    preset: 'vercel'
  },
  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    downloadSchema: false // Use committed schema.graphql (avoids network calls in CI)
  }
})
