/* eslint-disable @typescript-eslint/no-explicit-any */
import { defu } from 'defu'
import { defineNuxtModule, addPlugin, createResolver, installModule, hasNuxtModule, useLogger, type Resolver, addComponentsDir } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import type { ConsolaInstance } from 'consola'
import { randHashGenerator } from './utils'
import type { WPNuxtConfig } from './types/config'

export default defineNuxtModule<WPNuxtConfig>({
  meta: {
    name: 'wpnuxt',
    configKey: 'wpNuxt'
  },
  defaults: {
    wordpressUrl: undefined,
    graphqlEndpoint: '/graphql',
    downloadSchema: true,
    debug: false
  },
  async setup(options, nuxt) {
    const startTime = new Date().getTime()
    const wpNuxtConfig = loadConfig(options) as WPNuxtConfig

    const logger = getLogger(wpNuxtConfig)
    logger.debug('Starting WPNuxt in debug mode')

    const resolver = createResolver(import.meta.url)

    // will be picked up by the graphqlConfig plugin and added to each GraphQL fetch request
    nuxt.options.runtimeConfig.public.buildHash = randHashGenerator()
    addPlugin(resolver.resolve('./runtime/plugins/graphqlConfig'))

    await registerModules(nuxt, resolver, wpNuxtConfig)

    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      prefix: '',
      global: true
    })

    logger.info(`WPNuxt module loaded in ${new Date().getTime() - startTime}ms`)
  }
})

function loadConfig(options: Partial<WPNuxtConfig>): WPNuxtConfig {
  const config: WPNuxtConfig = defu({
    wordpressUrl: process.env.WPNUXT_WORDPRESS_URL,
    graphqlEndpoint: process.env.WPNUXT_GRAPHQL_ENDPOINT,
    downloadSchema: process.env.WPNUXT_DOWNLOAD_SCHEMA ? process.env.WPNUXT_DOWNLOAD_SCHEMA === 'true' : undefined,
    debug: process.env.WPNUXT_DEBUG ? process.env.WPNUXT_DEBUG === 'true' : undefined
  }, options) as WPNuxtConfig

  // validate config
  if (!config.wordpressUrl || config.wordpressUrl.length === 0) {
    throw new Error('WPNuxt error: WordPress url is missing')
  } else if (config.wordpressUrl.substring(config.wordpressUrl.length - 1) === '/') {
    throw new Error('WPNuxt error: WordPress url should not have a trailing slash: ' + config.wordpressUrl)
  }
  return config
}

async function registerModules(nuxt: Nuxt, resolver: Resolver, wpNuxtConfig: WPNuxtConfig) {
  const logger = getLogger(wpNuxtConfig)
  async function registerModule(name: string, key: string, options: Record<string, any>) {
    if (!hasNuxtModule(name)) {
      await installModule(name, options)
    } else {
      logger.debug(`${name} module already registered, using the 'graphqlMiddleware' config from nuxt.config.ts`);
      (nuxt.options as any)[key] = defu((nuxt.options as any)[key], options)
    }
  }

  await registerModule('nuxt-graphql-middleware', 'graphql', {
    debug: wpNuxtConfig.debug,
    graphqlEndpoint: `${wpNuxtConfig.wordpressUrl}${wpNuxtConfig.graphqlEndpoint}`,
    autoImportPatterns: [resolver.resolve('./runtime/queries/**/*.gql')],
    includeComposables: true,
    downloadSchema: wpNuxtConfig.downloadSchema,
    clientCache: {
      // Enable or disable the caching feature.
      enabled: true,
      // Cache a maximum of 50 queries (default: 100).
      maxSize: 50
    }
  })
  await registerModule('@radya/nuxt-dompurify', 'dompurify', {})
}

function getLogger(wpNuxtConfig: WPNuxtConfig): ConsolaInstance {
  return useLogger('wpnuxt', { level: wpNuxtConfig.debug ? 4 : 3 })
}
