import auth from '../../../src/module'
import core from '../../../../core/src/module'

export default defineNuxtConfig({
  modules: [
    core,
    auth
  ],
  wpNuxt: {
    wordpressUrl: 'https://wordpress.wpnuxt.com',
    downloadSchema: false
  },
  wpNuxtAuth: {
    enabled: true,
    providers: {
      password: { enabled: true },
      oauth: { enabled: false },
      headlessLogin: { enabled: false }
    }
  }
})
