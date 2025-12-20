import { defu } from 'defu'
import { existsSync, copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver, installModule, hasNuxtModule, addComponentsDir, addTemplate, addTypeTemplate, addImports } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import type { Import } from 'unimport'
import type { WPNuxtConfig } from './types/config'
import type { WPNuxtContext } from './types/queries'
import { generateWPNuxtComposables } from './generate'
import { getLogger, initLogger, mergeQueries, randHashGenerator } from './utils/index'

export default defineNuxtModule<WPNuxtConfig>({
  meta: {
    name: 'wpnuxt',
    configKey: 'wpNuxt'
  },
  defaults: {
    wordpressUrl: undefined,
    graphqlEndpoint: '/graphql',
    queries: {
      extendFolder: 'extend/queries/',
      mergedOutputFolder: '.queries/'
    },
    downloadSchema: true,
    debug: false,
    cache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
      swr: true
    }
  },
  async setup(options, nuxt) {
    const startTime = new Date().getTime()
    const wpNuxtConfig = loadConfig(options, nuxt) as WPNuxtConfig
    const logger = initLogger(wpNuxtConfig.debug)

    logger.debug('Starting WPNuxt in debug mode')

    const resolver = createResolver(import.meta.url)

    // will be picked up by the graphqlConfig plugin and added to each GraphQL fetch request
    nuxt.options.runtimeConfig.public.buildHash = randHashGenerator()
    addPlugin(resolver.resolve('./runtime/plugins/graphqlConfig'))

    const mergedQueriesFolder = await mergeQueries(nuxt, wpNuxtConfig, resolver)

    // Set up server options for nuxt-graphql-middleware (cookie/auth forwarding)
    setupServerOptions(nuxt, resolver, logger)

    await registerModules(nuxt, resolver, wpNuxtConfig, mergedQueriesFolder)

    // Configure Nitro route rules for caching GraphQL requests if enabled
    if (wpNuxtConfig.cache?.enabled !== false) {
      const maxAge = wpNuxtConfig.cache?.maxAge ?? 300
      nuxt.options.nitro.routeRules = nuxt.options.nitro.routeRules || {}
      nuxt.options.nitro.routeRules['/api/graphql_middleware/**'] = {
        cache: {
          maxAge,
          swr: wpNuxtConfig.cache?.swr !== false
        }
      }
      logger.debug(`Server-side caching enabled for GraphQL requests (maxAge: ${maxAge}s, SWR: ${wpNuxtConfig.cache?.swr !== false})`)
    }

    addImports([
      { name: 'useWPContent', as: 'useWPContent', from: resolver.resolve('./runtime/composables/useWPContent') },
      { name: 'useAsyncWPContent', as: 'useAsyncWPContent', from: resolver.resolve('./runtime/composables/useWPContent') }
    ])
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      prefix: '',
      global: true
    })

    logger.trace('Start generating composables')

    const ctx: WPNuxtContext = {
      fns: [],
      fnImports: [],
      composablesPrefix: 'use'
    }
    await generateWPNuxtComposables(ctx, mergedQueriesFolder, createResolver(pathToFileURL(nuxt.options.srcDir).toString()))

    nuxt.options.alias['#wpnuxt'] = resolver.resolve(nuxt.options.buildDir, 'wpnuxt')
    nuxt.options.alias['#wpnuxt/*'] = resolver.resolve(nuxt.options.buildDir, 'wpnuxt', '*')
    nuxt.options.alias['#wpnuxt/types'] = resolver.resolve('./types')
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#wpnuxt/types'] = resolver.resolve('./types')

    nuxt.options.nitro.externals = nuxt.options.nitro.externals || {}
    nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || []

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
    logger.trace('Finished generating composables')

    logger.info(`WPNuxt module loaded in ${new Date().getTime() - startTime}ms`)
  }
})

function loadConfig(options: Partial<WPNuxtConfig>, nuxt: Nuxt): WPNuxtConfig {
  const config: WPNuxtConfig = defu({
    wordpressUrl: process.env.WPNUXT_WORDPRESS_URL,
    graphqlEndpoint: process.env.WPNUXT_GRAPHQL_ENDPOINT,
    downloadSchema: process.env.WPNUXT_DOWNLOAD_SCHEMA ? process.env.WPNUXT_DOWNLOAD_SCHEMA === 'true' : undefined,
    debug: process.env.WPNUXT_DEBUG ? process.env.WPNUXT_DEBUG === 'true' : undefined
  }, options) as WPNuxtConfig

  nuxt.options.runtimeConfig.public.wordpressUrl = config.wordpressUrl
  nuxt.options.runtimeConfig.public.wpNuxt = {
    wordpressUrl: config.wordpressUrl,
    graphqlEndpoint: config.graphqlEndpoint,
    cache: {
      enabled: config.cache?.enabled ?? true,
      maxAge: config.cache?.maxAge ?? 300,
      swr: config.cache?.swr ?? true
    }
  }

  // validate config
  if (!config.wordpressUrl?.trim()) {
    throw new Error('WPNuxt error: WordPress url is missing')
  }
  if (config.wordpressUrl.endsWith('/')) {
    throw new Error(`WPNuxt error: WordPress url should not have a trailing slash: ${config.wordpressUrl}`)
  }
  return config
}

function setupServerOptions(nuxt: Nuxt, resolver: Resolver, logger: ReturnType<typeof getLogger>) {
  const serverDir = nuxt.options.serverDir
  const targetPath = join(serverDir, 'graphqlMiddleware.serverOptions.ts')

  // Check if user already has a custom server options file
  if (existsSync(targetPath)) {
    logger.debug('Using existing graphqlMiddleware.serverOptions.ts from project')
    return
  }

  // Ensure server directory exists
  if (!existsSync(serverDir)) {
    mkdirSync(serverDir, { recursive: true })
  }

  // Copy WPNuxt's default server options
  const sourcePath = resolver.resolve('./runtime/server/graphqlMiddleware.serverOptions.ts')
  copyFileSync(sourcePath, targetPath)
  logger.debug('Created graphqlMiddleware.serverOptions.ts with WPNuxt defaults (cookie/auth forwarding)')
}

async function registerModules(nuxt: Nuxt, resolver: Resolver, wpNuxtConfig: WPNuxtConfig, mergedQueriesFolder: string) {
  const logger = getLogger()
  async function registerModule(name: string, key: string, options: Record<string, unknown>) {
    if (!hasNuxtModule(name)) {
      await installModule(name, options)
    } else {
      logger.debug(`${name} module already registered, using the 'graphqlMiddleware' config from nuxt.config.ts`);
      (nuxt.options as never)[key] = defu((nuxt.options as never)[key], options)
    }
  }
  await registerModule('nuxt-graphql-middleware', 'graphql', {
    debug: wpNuxtConfig.debug,
    graphqlEndpoint: `${wpNuxtConfig.wordpressUrl}${wpNuxtConfig.graphqlEndpoint}`,
    autoImportPatterns: [mergedQueriesFolder],
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
