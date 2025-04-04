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
    validateConfig(options)

    const buildHash = randHashGenerator()
    nuxt.options.runtimeConfig.buildHash = buildHash

    const { resolve } = createResolver(import.meta.url)

    addPlugin(resolve('./runtime/plugins/graphqlConfig'))

    async function registerModule(name: string, key: string, options: Record<string, any>) {
      if (!hasNuxtModule(name)) {
        await installModule(name, options)
      } else {
        (nuxt.options as any)[key] = defu((nuxt.options as any)[key], options)
      }
    }

    await registerModule('nuxt-graphql-middleware', 'graphql', {
      debug: true,
      graphqlEndpoint: `${options.wordpressUrl}/graphql`,
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
