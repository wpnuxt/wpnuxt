import { defineNuxtModule, addComponentsDir, addServerHandler, createResolver, installModule, addTemplate, addTypeTemplate, addImportsDir, type Resolver, addPlugin, hasNuxtModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { consola } from 'consola'
import type { Import } from 'unimport'
import { name, version } from '../package.json'
import type { WPNuxtConfig } from './types'
import { initLogger, mergeQueries, validateConfig } from './utils'
import { generateWPNuxtComposables } from './generate'
import type { WPNuxtContext } from './context'

interface NitroStorageItem {
  storage: {
    getKeys: (prefix: string) => Promise<string[]>
    removeItem: (key: string) => Promise<void>
  }
}

const defaultConfigs: WPNuxtConfig = {
  wordpressUrl: '',
  frontendUrl: '',
  defaultMenuName: 'main',
  enableCache: true,
  cacheMaxAge: 300,
  staging: false,
  logLevel: 3,
  composablesPrefix: 'useWP',
  hasBlocksModule: false,
  hasAuthModule: false
}

export default defineNuxtModule<WPNuxtConfig>({
  meta: {
    name,
    version,
    configKey: 'wpNuxt',
    nuxt: '>=3.1.0'
  },
  // Default configuration options of the Nuxt module
  defaults: defaultConfigs,
  async setup(options: WPNuxtConfig, nuxt: Nuxt) {
    const startTime = new Date().getTime()
    consola.log('::: Starting WPNuxt setup ::: ')

    const publicWPNuxtConfig: WPNuxtConfig = {
      wordpressUrl: process.env.WPNUXT_WORDPRESS_URL || options.wordpressUrl!,
      frontendUrl: process.env.WPNUXT_FRONTEND_URL || options.frontendUrl!,
      defaultMenuName: process.env.WPNUXT_DEFAULT_MENU_NAME || options.defaultMenuName!,
      enableCache: process.env.WPNUXT_ENABLE_CACHE ? process.env.WPNUXT_ENABLE_CACHE === 'true' : options.enableCache!,
      cacheMaxAge: process.env.WPNUXT_CACHE_MAX_AGE ? Number.parseInt(process.env.WPNUXT_CACHE_MAX_AGE) : options.cacheMaxAge,
      staging: process.env.WPNUXT_STAGING === 'true' || options.staging!,
      downloadSchema: process.env.WPNUXT_DOWNLOAD_SCHEMA === 'true' || options.downloadSchema,
      logLevel: process.env.WPNUXT_LOG_LEVEL ? Number.parseInt(process.env.WPNUXT_LOG_LEVEL) : options.logLevel,
      composablesPrefix: process.env.WPNUXT_COMPOSABLES_PREFIX || options.composablesPrefix,
      hasBlocksModule: hasNuxtModule('@wpnuxt/blocks'),
      hasAuthModule: hasNuxtModule('@wpnuxt/auth')
    }
    nuxt.options.runtimeConfig.public.wpNuxt = publicWPNuxtConfig
    validateConfig(publicWPNuxtConfig)
    const logger = initLogger(publicWPNuxtConfig.logLevel)
    logger.debug('Config:', publicWPNuxtConfig)

    logger.debug('Connecting GraphQL to', publicWPNuxtConfig.wordpressUrl)
    logger.info('WPNuxt frontend URL:', publicWPNuxtConfig.frontendUrl)
    if (publicWPNuxtConfig.enableCache) logger.info('Cache enabled')
    logger.debug('Debug mode enabled, log level:', publicWPNuxtConfig.logLevel)
    if (publicWPNuxtConfig.staging) logger.info('Staging enabled')

    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolve('./runtime', path)
    const srcResolver: Resolver = createResolver(nuxt.options.srcDir)

    nuxt.options.alias['#wpnuxt'] = resolve(nuxt.options.buildDir, 'wpnuxt')
    nuxt.options.alias['#wpnuxt/*'] = resolve(nuxt.options.buildDir, 'wpnuxt', '*')
    nuxt.options.alias['#wpnuxt/types'] = resolve('./types')
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#wpnuxt/types'] = resolve('./types')

    nuxt.options.nitro.externals = nuxt.options.nitro.externals || {}
    nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || []

    addPlugin({
      src: resolveRuntimeModule('plugins/vue-sanitize-directive')
    })

    // Auto-discover all composables from the directory
    addImportsDir(resolveRuntimeModule('./composables'))

    addComponentsDir({
      path: resolveRuntimeModule('./components'),
      pathPrefix: false,
      prefix: '',
      global: false, // Lazy load components for better performance
      extensions: ['.vue']
    })
    addServerHandler({
      route: '/api/_wpnuxt/content',
      handler: resolveRuntimeModule('./server/api/_wpnuxt/content.post')
    })
    addServerHandler({
      route: '/api/_wpnuxt/config',
      handler: resolveRuntimeModule('./server/api/_wpnuxt/config')
    })

    // Parallelize independent operations for faster setup
    const [_, mergedQueriesFolder] = await Promise.all([
      installModule('@vueuse/nuxt', {}),
      mergeQueries(nuxt)
    ])

    await installModule('nuxt-graphql-middleware', {
      debug: publicWPNuxtConfig.logLevel ? publicWPNuxtConfig.logLevel > 3 : false,
      graphqlEndpoint: `${publicWPNuxtConfig.wordpressUrl}/graphql`,
      downloadSchema: publicWPNuxtConfig.downloadSchema,
      codegenConfig: {
        debugMode: publicWPNuxtConfig.logLevel ? publicWPNuxtConfig.logLevel > 3 : false,
        useCache: !publicWPNuxtConfig.downloadSchema // Cache when schema is committed
      },
      codegenSchemaConfig: {
        urlSchemaOptions: {
          headers: {
            Authorization: 'server-token'
          }
        }
      },
      outputDocuments: true,
      autoImportPatterns: [mergedQueriesFolder],
      includeComposables: true,
      devtools: true
    })

    logger.trace('Start generating composables')

    const ctx: WPNuxtContext = await {
      fns: [],
      fnImports: [],
      composablesPrefix: publicWPNuxtConfig.composablesPrefix
    }
    await generateWPNuxtComposables(ctx, mergedQueriesFolder, srcResolver)

    addTemplate({
      write: true,
      filename: 'wpnuxt/index.mjs',
      getContents: () => ctx.generateImports?.() || ''
    })
    addTypeTemplate({
      write: true,
      filename: 'wpnuxt/index.d.ts',
      getContents: () => ctx.generateDeclarations?.() || ''
    })
    nuxt.hook('imports:extend', (autoimports: Import[]) => {
      autoimports.push(...(ctx.fnImports || []))
    })

    nuxt.hook('nitro:init', async (nitro: NitroStorageItem) => {
      // Remove content cache when nitro starts
      const keys = await nitro.storage.getKeys('cache:api:wpContent')
      keys.forEach(async (key: string) => {
        if (key.startsWith('cache:api:wpContent')) await nitro.storage.removeItem(key)
      })
    })

    const endTime = new Date().getTime()
    logger.success('::: Finished WPNuxt setup in ' + (endTime - startTime) + 'ms ::: ')
  }
})

declare module '@nuxt/schema' {

  interface RuntimeConfig {
    wpNuxt: {
      faustSecretKey: string
    }
  }

  interface PublicRuntimeConfig {
    wpNuxt: WPNuxtConfig
  }

  interface ConfigSchema {
    wpNuxt: {
      faustSecretKey: string
    }
    runtimeConfig: {
      public?: {
        wpNuxt: WPNuxtConfig
      }
    }
  }
}
export type { WPNuxtConfig, WPNuxtConfigQueries, WPNuxtQuery } from './types'
