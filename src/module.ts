/* eslint-disable @typescript-eslint/no-explicit-any */
import { defu } from 'defu'
import { defineNuxtModule, addPlugin, createResolver, installModule, hasNuxtModule } from '@nuxt/kit'
import type { WPNuxtConfig } from './types/config'
import { validateConfig, randHashGenerator } from './utils'

export default defineNuxtModule<WPNuxtConfig>({
  meta: {
    name: 'wpnuxt',
    configKey: 'wpNuxt'
  },
  defaults: {
    wordpressUrl: ''
  },
  async setup(options, nuxt) {
    // Runtime Config
    const runtimeConfig = nuxt.options.runtimeConfig

    runtimeConfig.wpNuxt = defu({
      wordpressUrl: process.env.WPNUXT_WORDPRESS_URL
    }, options) as WPNuxtConfig
    validateConfig(runtimeConfig.wpNuxt)

    runtimeConfig.buildHash = randHashGenerator()

    const { resolve } = createResolver(import.meta.url)

    // Plugins
    addPlugin(resolve('./runtime/plugins/graphqlConfig'))

    // Modules
    async function registerModule(name: string, key: string, options: Record<string, any>) {
      if (!hasNuxtModule(name)) {
        await installModule(name, options)
      } else {
        (nuxt.options as any)[key] = defu((nuxt.options as any)[key], options)
      }
    }

    await registerModule('nuxt-graphql-middleware', 'graphql', {
      debug: true,
      graphqlEndpoint: `${runtimeConfig.wpNuxt.wordpressUrl}/graphql`,
      autoImportPatterns: [resolve('./runtime/queries/**/*.gql')],
      includeComposables: true,
      clientCache: {
        // Enable or disable the caching feature.
        enabled: true,
        // Cache a maximum of 50 queries (default: 100).
        maxSize: 50
      }
    })
    await registerModule('@radya/nuxt-dompurify', 'dompurify', {})
  }
})
