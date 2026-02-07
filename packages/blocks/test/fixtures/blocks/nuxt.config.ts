import wpNuxtCore from '../../../../core/src/module'
import wpNuxtBlocks from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    wpNuxtCore,
    wpNuxtBlocks
  ],
  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    downloadSchema: false
  },
  wpNuxtBlocks: {
    imageDomains: ['wordpress.wpnuxt.com']
  }
})
