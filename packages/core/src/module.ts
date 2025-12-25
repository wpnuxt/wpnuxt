import { defu } from 'defu'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
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
    addPlugin(resolver.resolve('./runtime/plugins/graphqlErrors'))

    const mergedQueriesFolder = await mergeQueries(nuxt, wpNuxtConfig, resolver)

    // Set up server and client options for nuxt-graphql-middleware
    setupServerOptions(nuxt, resolver, logger)
    setupClientOptions(nuxt, resolver, logger)

    await registerModules(nuxt, resolver, wpNuxtConfig, mergedQueriesFolder)

    // Customize the nuxt-graphql-middleware devtools tab for WPNuxt branding
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - devtools:customTabs is from @nuxt/devtools
    nuxt.hook('devtools:customTabs', (tabs: Array<{ name: string, title?: string, icon?: string }>) => {
      const middlewareTab = tabs.find((tab: { name: string }) => tab.name === 'nuxt-graphql-middleware')
      if (middlewareTab) {
        middlewareTab.title = 'WPNuxt GraphQL'
        middlewareTab.icon = 'simple-icons:wordpress'
      }
    })

    // Configure Nitro route rules for caching GraphQL requests if enabled
    if (wpNuxtConfig.cache?.enabled !== false) {
      const maxAge = wpNuxtConfig.cache?.maxAge ?? 300
      nuxt.options.nitro.routeRules = nuxt.options.nitro.routeRules || {}
      nuxt.options.nitro.routeRules['/api/wpnuxt/**'] = {
        cache: {
          maxAge,
          swr: wpNuxtConfig.cache?.swr !== false
        }
      }
      logger.debug(`Server-side caching enabled for GraphQL requests (maxAge: ${maxAge}s, SWR: ${wpNuxtConfig.cache?.swr !== false})`)
    }

    // Configure Vercel-specific settings for proper SSR and ISR handling
    configureVercelSettings(nuxt, logger)

    addImports([
      { name: 'useWPContent', as: 'useWPContent', from: resolver.resolve('./runtime/composables/useWPContent') },
      { name: 'useAsyncWPContent', as: 'useAsyncWPContent', from: resolver.resolve('./runtime/composables/useWPContent') }
      // Note: useGraphqlMutation is auto-imported via nuxt-graphql-middleware with includeComposables: true
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
    await generateWPNuxtComposables(ctx, mergedQueriesFolder, createResolver(nuxt.options.srcDir))

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
    // Only override downloadSchema if env var is explicitly set
    downloadSchema: process.env.WPNUXT_DOWNLOAD_SCHEMA !== undefined
      ? process.env.WPNUXT_DOWNLOAD_SCHEMA === 'true'
      : undefined,
    debug: process.env.WPNUXT_DEBUG ? process.env.WPNUXT_DEBUG === 'true' : undefined
  }, options) as WPNuxtConfig

  // Ensure downloadSchema defaults to true if not explicitly set
  if (config.downloadSchema === undefined) {
    config.downloadSchema = true
  }

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

const SERVER_OPTIONS_TEMPLATE = `import { defineGraphqlServerOptions } from '@wpnuxt/core/server-options'
import { getHeader, getCookie } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * WPNuxt default server options for nuxt-graphql-middleware.
 *
 * This enables:
 * - Cookie forwarding for WordPress preview mode
 * - Authorization header forwarding for authenticated requests
 * - Auth token from cookie for @wpnuxt/auth
 * - Consistent error logging
 *
 * Users can customize by creating their own server/graphqlMiddleware.serverOptions.ts
 */
export default defineGraphqlServerOptions({
  async serverFetchOptions(event, _operation, _operationName, _context) {
    // Get auth token from Authorization header or from cookie
    let authorization = getHeader(event, 'authorization') || ''

    // If no Authorization header, check for auth token in cookie (@wpnuxt/auth)
    if (!authorization) {
      const config = useRuntimeConfig().public.wpNuxtAuth as { cookieName?: string } | undefined
      const cookieName = config?.cookieName || 'wpnuxt-auth-token'
      const authToken = getCookie(event, cookieName)
      if (authToken) {
        authorization = \`Bearer \${authToken}\`
      }
    }

    return {
      headers: {
        // Forward WordPress auth cookies for previews
        Cookie: getHeader(event, 'cookie') || '',
        // Forward authorization header or token from cookie
        Authorization: authorization
      }
    }
  },

  async onServerError(event, error, _operation, operationName) {
    const url = event.node.req.url || 'unknown'
    console.error(\`[WPNuxt] GraphQL error in \${operationName} (\${url}):\`, error.message)
  }
})
`

function setupServerOptions(nuxt: Nuxt, _resolver: Resolver, logger: ReturnType<typeof getLogger>) {
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

  // Write WPNuxt's default server options
  writeFileSync(targetPath, SERVER_OPTIONS_TEMPLATE)
  logger.debug('Created graphqlMiddleware.serverOptions.ts with WPNuxt defaults (cookie/auth forwarding)')
}

const CLIENT_OPTIONS_TEMPLATE = `import { defineGraphqlClientOptions } from '@wpnuxt/core/client-options'
import { useRoute } from '#imports'

/**
 * WPNuxt default client options for nuxt-graphql-middleware.
 *
 * This enables passing client context to the server for:
 * - Preview mode (passes preview flag and token from URL query params)
 *
 * The context is available in serverFetchOptions via context.client
 * All values must be strings (nuxt-graphql-middleware requirement)
 *
 * Users can customize by creating their own app/graphqlMiddleware.clientOptions.ts
 */
export default defineGraphqlClientOptions<{
  preview?: string
  previewToken?: string
}>({
  buildClientContext() {
    const route = useRoute()

    return {
      // Context values must be strings - use 'true'/'false' instead of boolean
      preview: route.query.preview === 'true' ? 'true' : undefined,
      previewToken: route.query.token as string | undefined
    }
  }
})
`

function setupClientOptions(nuxt: Nuxt, _resolver: Resolver, logger: ReturnType<typeof getLogger>) {
  // Client options go in the app directory (Nuxt 4 structure)
  // In Nuxt 4, nuxt.options.dir.app is an absolute path
  const appDir = nuxt.options.dir.app
  const targetPath = join(appDir, 'graphqlMiddleware.clientOptions.ts')

  // Check if user already has a custom client options file
  if (existsSync(targetPath)) {
    logger.debug('Using existing graphqlMiddleware.clientOptions.ts from project')
    return
  }

  // Ensure app directory exists
  if (!existsSync(appDir)) {
    mkdirSync(appDir, { recursive: true })
  }

  // Write WPNuxt's default client options
  writeFileSync(targetPath, CLIENT_OPTIONS_TEMPLATE)
  logger.debug('Created graphqlMiddleware.clientOptions.ts with WPNuxt defaults (preview mode support)')
}

/**
 * Configure Vercel-specific settings for proper SSR and ISR handling.
 *
 * This fixes issues with:
 * 1. Catch-all routes not being server-rendered on Vercel
 * 2. ISR response handling causing data extraction issues
 *
 * @see https://github.com/wpnuxt/wpnuxt/issues/2
 */
function configureVercelSettings(nuxt: Nuxt, logger: ReturnType<typeof getLogger>) {
  // Detect if we're building for Vercel
  const isVercel = process.env.VERCEL === '1' || nuxt.options.nitro.preset === 'vercel'

  if (isVercel) {
    logger.debug('Vercel deployment detected, applying recommended settings')

    // Enable native SWR for proper Vercel ISR handling
    // This fixes issues with GraphQL response data not being properly passed to the client
    nuxt.options.nitro.future = nuxt.options.nitro.future || {}
    if (nuxt.options.nitro.future.nativeSWR === undefined) {
      nuxt.options.nitro.future.nativeSWR = true
      logger.debug('Enabled nitro.future.nativeSWR for Vercel ISR compatibility')
    }

    // Ensure SSR is enabled for all routes (fixes catch-all route issues)
    // Users can override specific routes if needed
    nuxt.options.routeRules = nuxt.options.routeRules || {}
    if (!nuxt.options.routeRules['/**']) {
      // Note: ssr property exists in NuxtConfig but NitroRouteConfig type is incomplete in Nuxt 4
      // See: https://github.com/nuxt/nuxt/issues/32561
      nuxt.options.routeRules['/**'] = { ssr: true } as Record<string, unknown>
      logger.debug('Enabled SSR for all routes (routeRules[\'/**\'] = { ssr: true })')
    }
  }
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
    downloadSchema: wpNuxtConfig.downloadSchema ?? true,
    enableFileUploads: true,
    // Use WPNuxt-branded API route prefix
    serverApiPrefix: '/api/wpnuxt',
    clientCache: {
      // Enable or disable the caching feature.
      enabled: true,
      // Cache a maximum of 50 queries (default: 100).
      maxSize: 50
    },
    codegenConfig: {
      // WordPress-specific scalar mappings
      scalars: {
        DateTime: 'string',
        ID: 'string'
      }
    },
    experimental: {
      // Use improved query parameter encoding for better URL handling
      improvedQueryParamEncoding: true
    }
  })
  await registerModule('@radya/nuxt-dompurify', 'dompurify', {})
}
