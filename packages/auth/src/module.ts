import { join } from 'node:path'
import { defineNuxtModule, addPlugin, createResolver, addImports, addServerHandler, useLogger } from '@nuxt/kit'
import type { WPNuxtAuthConfig } from './runtime/types'
import { validateAuthSchema } from './utils/schemaDetection'

declare module '@nuxt/schema' {
  interface NuxtHooks {
    /**
     * Contribute additional GraphQL query folders to WPNuxt's merged queries.
     * Declared here because @wpnuxt/core's type augmentation isn't importable
     * (its exports map only exposes dist/). Must stay in sync with
     * packages/core/src/types/nuxt-augment.d.ts.
     */
    'wpnuxt:queries:folders': (folders: string[]) => void | Promise<void>
  }
}

export type { WPNuxtAuthConfig }

// Default OAuth settings for miniOrange WP OAuth Server
const DEFAULT_OAUTH_CONFIG = {
  enabled: false,
  clientId: '',
  clientSecret: '',
  authorizationEndpoint: '/wp-json/moserver/authorize',
  tokenEndpoint: '/wp-json/moserver/token',
  userInfoEndpoint: '/wp-json/moserver/resource',
  scopes: ['openid', 'profile', 'email']
}

// Default Headless Login settings (Google, GitHub, etc. via Headless Login for WPGraphQL)
const DEFAULT_HEADLESS_LOGIN_CONFIG = {
  enabled: false
}

export default defineNuxtModule<WPNuxtAuthConfig>({
  meta: {
    name: '@wpnuxt/auth',
    configKey: 'wpNuxtAuth',
    compatibility: {
      nuxt: '>=4.4.0'
    }
  },
  defaults: {
    enabled: true,
    cookieName: 'wpnuxt-auth-token',
    refreshCookieName: 'wpnuxt-refresh-token',
    tokenMaxAge: 3600,
    refreshTokenMaxAge: 604800,
    redirectOnLogin: '/',
    redirectOnLogout: '/',
    loginPage: '/login',
    providers: {
      password: { enabled: true },
      oauth: DEFAULT_OAUTH_CONFIG,
      headlessLogin: DEFAULT_HEADLESS_LOGIN_CONFIG
    }
  },
  async setup(options, nuxt) {
    if (!options.enabled) {
      return
    }

    const resolver = createResolver(import.meta.url)

    // Contribute auth queries (Login/RefreshToken mutations, Viewer override)
    // to @wpnuxt/core's merged queries folder. Core collects these at
    // modules:done and merges them into its configured mergedOutputFolder
    // with the right precedence (defaults < contributions < user extends),
    // so module order doesn't matter and custom output folders are respected.
    nuxt.hook('wpnuxt:queries:folders', (folders) => {
      folders.push(resolver.resolve('./runtime/queries'))
    })

    // Merge OAuth config with defaults
    const oauthConfig = {
      ...DEFAULT_OAUTH_CONFIG,
      ...options.providers?.oauth
    }
    const headlessLoginConfig = {
      ...DEFAULT_HEADLESS_LOGIN_CONFIG,
      ...options.providers?.headlessLogin
    }
    const passwordEnabled = options.providers?.password?.enabled ?? true
    const oauthEnabled = oauthConfig.enabled && !!oauthConfig.clientId
    const headlessLoginEnabled = headlessLoginConfig.enabled ?? false

    // Validate that Headless Login plugin is installed if password or headless login auth is enabled
    // (miniOrange OAuth doesn't require this plugin)
    // Use a flag to prevent duplicate validation errors in dev mode (server + client builds)
    const nuxtWithFlag = nuxt as typeof nuxt & { _wpnuxtAuthValidated?: boolean }
    if ((passwordEnabled || headlessLoginEnabled) && !nuxtWithFlag._wpnuxtAuthValidated) {
      nuxtWithFlag._wpnuxtAuthValidated = true
      // Schema is at the project root (nuxt.options.rootDir), not srcDir
      const schemaPath = join(nuxt.options.rootDir, 'schema.graphql')
      validateAuthSchema(schemaPath, {
        requirePassword: passwordEnabled,
        requireHeadlessLogin: headlessLoginEnabled
      })
    }

    // Add public runtime config (no secrets)
    nuxt.options.runtimeConfig.public.wpNuxtAuth = {
      cookieName: options.cookieName!,
      refreshCookieName: options.refreshCookieName!,
      tokenMaxAge: options.tokenMaxAge!,
      refreshTokenMaxAge: options.refreshTokenMaxAge!,
      redirectOnLogin: options.redirectOnLogin!,
      redirectOnLogout: options.redirectOnLogout!,
      loginPage: options.loginPage!,
      providers: {
        password: { enabled: passwordEnabled },
        oauth: {
          enabled: oauthEnabled,
          clientId: oauthConfig.clientId,
          authorizationEndpoint: oauthConfig.authorizationEndpoint,
          scopes: oauthConfig.scopes
        },
        headlessLogin: {
          enabled: headlessLoginEnabled
        }
      }
    }

    // Add private runtime config for OAuth secrets
    if (oauthEnabled) {
      nuxt.options.runtimeConfig.wpNuxtAuthOAuth = {
        clientId: oauthConfig.clientId,
        clientSecret: oauthConfig.clientSecret,
        tokenEndpoint: oauthConfig.tokenEndpoint,
        userInfoEndpoint: oauthConfig.userInfoEndpoint
      }
    }

    // Add auth plugin
    addPlugin(resolver.resolve('./runtime/plugins/auth'))

    // Auto-import composables
    addImports([
      { name: 'useWPAuth', from: resolver.resolve('./runtime/composables/useWPAuth') },
      { name: 'useWPUser', from: resolver.resolve('./runtime/composables/useWPUser') }
    ])

    // Logout endpoint (always registered - clears httpOnly cookies)
    // Uses _wpnuxt-auth prefix to avoid conflicts with user routes
    addServerHandler({
      route: '/api/_wpnuxt-auth/logout',
      method: 'post',
      handler: resolver.resolve('./runtime/server/api/auth/logout.post')
    })

    // Add server API handlers for OAuth (miniOrange)
    if (oauthEnabled) {
      addServerHandler({
        route: '/api/_wpnuxt-auth/oauth/authorize',
        method: 'get',
        handler: resolver.resolve('./runtime/server/api/auth/oauth/authorize.get')
      })
      addServerHandler({
        route: '/api/_wpnuxt-auth/oauth/callback',
        method: 'get',
        handler: resolver.resolve('./runtime/server/api/auth/oauth/callback.get')
      })
    }

    // Add server API handlers for Headless Login providers (Google, GitHub, etc.)
    if (headlessLoginEnabled) {
      addServerHandler({
        route: '/api/_wpnuxt-auth/provider/:provider/authorize',
        method: 'get',
        handler: resolver.resolve('./runtime/server/api/auth/provider/[provider]/authorize.get')
      })
      addServerHandler({
        route: '/api/_wpnuxt-auth/provider/:provider/callback',
        method: 'get',
        handler: resolver.resolve('./runtime/server/api/auth/provider/[provider]/callback.get')
      })
    }

    // Add type declarations
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({
        path: resolver.resolve('./runtime/types/index.ts')
      })
    })

    const logger = useLogger('wpnuxt:auth')
    const providers = []
    if (passwordEnabled) providers.push('password')
    if (oauthEnabled) providers.push('oauth')
    if (headlessLoginEnabled) providers.push('headlessLogin')
    logger.info(`Module loaded (providers: ${providers.join(', ') || 'none'})`)
  }
})
