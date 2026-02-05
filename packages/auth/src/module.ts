import { existsSync, cpSync } from 'node:fs'
import { join } from 'node:path'
import { defineNuxtModule, addPlugin, createResolver, addImports, addServerHandler, useLogger } from '@nuxt/kit'
import type { WPNuxtAuthConfig } from './runtime/types'
import { validateAuthSchema } from './utils/schemaDetection'

/**
 * Helper type for accessing WPNuxt config from Nuxt options.
 * This is needed because @wpnuxt/auth may be installed without @wpnuxt/core types.
 */
interface WPNuxtQueriesConfig {
  queries?: {
    mergedOutputFolder?: string
    extendFolder?: string
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
      nuxt: '>=3.0.0'
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

    // Extend queries with auth-specific fragments
    const baseDir = nuxt.options.srcDir || nuxt.options.rootDir
    const { resolve } = createResolver(baseDir)
    const wpNuxtConfig = (nuxt.options as { wpNuxt?: WPNuxtQueriesConfig }).wpNuxt
    const mergedQueriesPath = resolve(wpNuxtConfig?.queries?.mergedOutputFolder || '.queries/')
    const userQueryPath = resolve(wpNuxtConfig?.queries?.extendFolder || 'extend/queries/')
    const authQueriesPath = resolver.resolve('./runtime/queries')

    // Copy auth queries (overrides core defaults)
    if (existsSync(authQueriesPath)) {
      cpSync(authQueriesPath, mergedQueriesPath, { recursive: true })
    }

    // Re-copy user queries to ensure they still override auth
    if (existsSync(userQueryPath)) {
      cpSync(userQueryPath, mergedQueriesPath, { recursive: true })
    }

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
