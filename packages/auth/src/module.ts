import { defineNuxtModule, addPlugin, createResolver, addImports } from '@nuxt/kit'
import type { WPNuxtAuthConfig } from './runtime/types'

export type { WPNuxtAuthConfig }

export default defineNuxtModule<WPNuxtAuthConfig>({
  meta: {
    name: '@wpnuxt/auth',
    configKey: 'wpNuxtAuth'
  },
  defaults: {
    enabled: true,
    cookieName: 'wpnuxt-auth-token',
    refreshCookieName: 'wpnuxt-refresh-token',
    tokenMaxAge: 3600,
    refreshTokenMaxAge: 604800,
    redirectOnLogin: '/',
    redirectOnLogout: '/',
    loginPage: '/login'
  },
  async setup(options, nuxt) {
    if (!options.enabled) {
      return
    }

    const resolver = createResolver(import.meta.url)

    // Add runtime config
    nuxt.options.runtimeConfig.public.wpNuxtAuth = {
      cookieName: options.cookieName!,
      refreshCookieName: options.refreshCookieName!,
      tokenMaxAge: options.tokenMaxAge!,
      refreshTokenMaxAge: options.refreshTokenMaxAge!,
      redirectOnLogin: options.redirectOnLogin!,
      redirectOnLogout: options.redirectOnLogout!,
      loginPage: options.loginPage!
    }

    // Add auth plugin
    addPlugin(resolver.resolve('./runtime/plugins/auth'))

    // Auto-import composables
    addImports([
      { name: 'useWPAuth', from: resolver.resolve('./runtime/composables/useWPAuth') },
      { name: 'useWPUser', from: resolver.resolve('./runtime/composables/useWPUser') }
    ])

    // Add type declarations
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({
        path: resolver.resolve('./runtime/types/index.ts')
      })
    })

    console.log('[WPNuxt Auth] Module loaded')
  }
})
