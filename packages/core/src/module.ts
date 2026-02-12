import { defu } from 'defu'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { version } from '../package.json'
import { defineNuxtModule, addPlugin, createResolver, installModule, hasNuxtModule, addComponentsDir, addTemplate, addTypeTemplate, addImports } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import type { NitroConfig } from 'nitropack'
import type { Import } from 'unimport'
import type { WPNuxtConfig } from './types/config'
import type { WPNuxtContext } from './types/queries'
import { generateWPNuxtComposables } from './generate'
import { getLogger, initLogger, mergeQueries, randHashGenerator, createModuleError } from './utils/index'
import { validateWordPressEndpoint } from './utils/endpointValidation'
import { runInstall } from './install'

/**
 * Extended Nuxt options interface that includes properties available at runtime
 * but not fully typed in Nuxt's schema types.
 *
 * Note: Nuxt 4 types are still evolving. These properties exist at runtime
 * and are documented, but the type definitions lag behind.
 * @see https://github.com/nuxt/nuxt/issues/32561
 */
interface NuxtOptionsWithNitro {
  nitro: NitroConfig
  routeRules: Record<string, { ssr?: boolean, [key: string]: unknown }>
  runtimeConfig: {
    public: Record<string, unknown>
    [key: string]: unknown
  }
}

export default defineNuxtModule<WPNuxtConfig>({
  meta: {
    name: '@wpnuxt/core',
    version,
    configKey: 'wpNuxt',
    compatibility: {
      nuxt: '>=3.0.0'
    }
  },
  defaults: {
    wordpressUrl: undefined,
    graphqlEndpoint: '/graphql',
    queries: {
      extendFolder: 'extend/queries/',
      mergedOutputFolder: '.queries/',
      warnOnOverride: true
    },
    downloadSchema: true,
    replaceLinks: true,
    imageRelativePaths: false,
    debug: false,
    cache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
      swr: true
    }
  },
  async setup(options, nuxt) {
    const startTime = new Date().getTime()
    const wpNuxtConfig = await loadConfig(options, nuxt)
    if (!wpNuxtConfig) {
      const logger = initLogger(false)
      logger.warn('WordPress URL not configured. Skipping WPNuxt setup. Set it in nuxt.config.ts or via WPNUXT_WORDPRESS_URL environment variable.')
      return
    }
    const logger = initLogger(wpNuxtConfig.debug)

    logger.debug('Starting WPNuxt in debug mode')

    const resolver = createResolver(import.meta.url)

    // will be picked up by the graphqlConfig plugin and added to each GraphQL fetch request
    nuxt.options.runtimeConfig.public.buildHash = randHashGenerator()
    addPlugin(resolver.resolve('./runtime/plugins/graphqlConfig'))
    addPlugin(resolver.resolve('./runtime/plugins/graphqlErrors'))
    addPlugin(resolver.resolve('./runtime/plugins/sanitizeHtml'))

    // Configure trailing slash handling to match WordPress URI format
    // This ensures both server-side and client-side URLs use trailing slashes
    configureTrailingSlash(nuxt, logger)

    const mergedQueriesFolder = await mergeQueries(nuxt, wpNuxtConfig, resolver)

    // Set up server and client options for nuxt-graphql-middleware
    await setupServerOptions(nuxt, resolver, logger)
    await setupClientOptions(nuxt, resolver, logger)

    // Validate WordPress endpoint and download schema if needed
    const schemaPath = join(nuxt.options.rootDir, 'schema.graphql')
    const schemaExists = existsSync(schemaPath)

    if (wpNuxtConfig.downloadSchema) {
      if (!schemaExists) {
        // Schema doesn't exist - must download it (blocking, required for app to work)
        logger.debug(`Downloading schema from: ${wpNuxtConfig.wordpressUrl}${wpNuxtConfig.graphqlEndpoint}`)
        await validateWordPressEndpoint(
          wpNuxtConfig.wordpressUrl!,
          wpNuxtConfig.graphqlEndpoint,
          { schemaPath, authToken: wpNuxtConfig.schemaAuthToken }
        )
        logger.debug('Schema downloaded successfully')
      } else {
        // Schema exists - defer validation to ready hook (non-blocking)
        nuxt.hook('ready', async () => {
          try {
            await validateWordPressEndpoint(
              wpNuxtConfig.wordpressUrl!,
              wpNuxtConfig.graphqlEndpoint,
              { authToken: wpNuxtConfig.schemaAuthToken }
            )
            logger.debug('WordPress endpoint validation passed')
          } catch (error) {
            // Log warning but don't block app - schema already exists
            const message = error instanceof Error ? error.message : String(error)
            logger.warn(`WordPress endpoint validation failed: ${message.split('\n')[0]}`)
            logger.warn('App will continue with existing schema.graphql file')
          }
        })
      }
    }

    await registerModules(nuxt, resolver, wpNuxtConfig, mergedQueriesFolder)

    // Customize the nuxt-graphql-middleware devtools tab for WPNuxt branding
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - devtools:customTabs hook exists at runtime but type availability varies
    nuxt.hook('devtools:customTabs', (tabs: Array<{ name: string, title?: string, icon?: string }>) => {
      const middlewareTab = tabs.find(tab => tab.name === 'nuxt-graphql-middleware')
      if (middlewareTab) {
        middlewareTab.title = 'WPNuxt GraphQL'
        middlewareTab.icon = 'simple-icons:wordpress'
      }
    })

    // Configure Nitro route rules for caching GraphQL requests if enabled
    // Only cache query routes (GET), not mutation routes (POST).
    // Nitro's cachedEventHandler creates a request proxy with empty headers,
    // which causes h3's readRawBody to skip body reading (missing content-length),
    // breaking mutations that rely on readBody() for variables.
    if (wpNuxtConfig.cache?.enabled !== false) {
      const maxAge = wpNuxtConfig.cache?.maxAge ?? 300
      const nitroOptions = nuxt.options as unknown as NuxtOptionsWithNitro
      nitroOptions.nitro = nitroOptions.nitro || {}
      nitroOptions.nitro.routeRules = nitroOptions.nitro.routeRules || {}
      nitroOptions.nitro.routeRules['/api/wpnuxt/query/**'] = {
        cache: {
          maxAge,
          swr: wpNuxtConfig.cache?.swr !== false
        }
      }
      logger.debug(`Server-side caching enabled for GraphQL queries (maxAge: ${maxAge}s, SWR: ${wpNuxtConfig.cache?.swr !== false})`)
    }

    // Proxy /wp-content/uploads/ to WordPress for plain <img> tags and v-html content
    {
      const nitroOptions = nuxt.options as unknown as NuxtOptionsWithNitro
      nitroOptions.nitro = nitroOptions.nitro || {}
      nitroOptions.nitro.routeRules = nitroOptions.nitro.routeRules || {}
      nitroOptions.nitro.routeRules['/wp-content/uploads/**'] = {
        proxy: `${wpNuxtConfig.wordpressUrl}/wp-content/uploads/**`
      }
      logger.debug(`Configured WordPress uploads proxy: /wp-content/uploads/** → ${wpNuxtConfig.wordpressUrl}/wp-content/uploads/**`)
    }

    // Configure @nuxt/image for WordPress images
    // Templates should always use relative paths (/wp-content/uploads/...) via getRelativeImagePath()
    // - CDN providers (twicpics, cloudinary, etc.) append relative paths to their baseURL — works natively
    // - IPX needs full HTTP URLs to fetch remotely, so we add an alias + domain to handle that
    // Deferred to modules:done so @nuxt/image installed by @wpnuxt/blocks is already registered
    nuxt.hook('modules:done', () => {
      if (hasNuxtModule('@nuxt/image')) {
        const imageConfig = (nuxt.options as unknown as Record<string, unknown>).image as Record<string, unknown> || {}
        const provider = process.env.NUXT_IMAGE_PROVIDER || (imageConfig.provider as string) || 'ipx'

        if (provider === 'ipx') {
          const wpHost = new URL(wpNuxtConfig.wordpressUrl!).host
          const domains = (imageConfig.domains as string[]) || []
          if (!domains.includes(wpHost)) {
            domains.push(wpHost)
          }
          imageConfig.domains = domains

          const alias = (imageConfig.alias as Record<string, string>) || {}
          alias['/wp-content'] = `${wpNuxtConfig.wordpressUrl}/wp-content`
          imageConfig.alias = alias;

          (nuxt.options as unknown as Record<string, unknown>).image = imageConfig
          logger.debug(`Configured IPX for WordPress: alias /wp-content → ${wpNuxtConfig.wordpressUrl}/wp-content, domain '${wpHost}' added`)
        }
      }
    })

    // Configure Vercel-specific settings for proper SSR and ISR handling
    configureVercelSettings(nuxt, logger)

    addImports([
      { name: 'useWPContent', as: 'useWPContent', from: resolver.resolve('./runtime/composables/useWPContent') },
      { name: 'useAsyncWPContent', as: 'useAsyncWPContent', from: resolver.resolve('./runtime/composables/useWPContent') },
      { name: 'getRelativeImagePath', as: 'getRelativeImagePath', from: resolver.resolve('./runtime/util/images') },
      { name: 'isInternalLink', as: 'isInternalLink', from: resolver.resolve('./runtime/util/links') },
      { name: 'toRelativePath', as: 'toRelativePath', from: resolver.resolve('./runtime/util/links') },
      { name: 'usePrevNextPost', as: 'usePrevNextPost', from: resolver.resolve('./runtime/composables/usePrevNextPost') }
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

    // Alias @wpnuxt/core subpath exports to source files during development.
    // Without this, imports like '@wpnuxt/core/server-options' resolve to
    // dist/ jiti stubs (created by dev:prepare), which pull in node:module
    // and break Vite's client-side Rollup build.
    nuxt.options.alias['@wpnuxt/core/server-options'] = resolver.resolve('./server-options')
    nuxt.options.alias['@wpnuxt/core/client-options'] = resolver.resolve('./client-options')

    // Configure Nitro aliases and externals
    const nitroOpts = nuxt.options as unknown as NuxtOptionsWithNitro
    nitroOpts.nitro = nitroOpts.nitro || {}
    nitroOpts.nitro.alias = nitroOpts.nitro.alias || {}
    nitroOpts.nitro.alias['#wpnuxt/types'] = resolver.resolve('./types')

    nitroOpts.nitro.externals = nitroOpts.nitro.externals || {}
    nitroOpts.nitro.externals.inline = nitroOpts.nitro.externals.inline || []

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
  },

  async onInstall(nuxt) {
    await runInstall(nuxt)
  }
})

// =============================================================================
// Config Loading
// =============================================================================

async function loadConfig(options: Partial<WPNuxtConfig>, nuxt: Nuxt): Promise<WPNuxtConfig | null> {
  const config: WPNuxtConfig = defu({
    wordpressUrl: process.env.WPNUXT_WORDPRESS_URL,
    graphqlEndpoint: process.env.WPNUXT_GRAPHQL_ENDPOINT,
    schemaAuthToken: process.env.WPNUXT_SCHEMA_AUTH_TOKEN,
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

  // validate config
  if (!config.wordpressUrl?.trim()) {
    // During `nuxt prepare` (e.g. postinstall), skip validation so types can be generated
    if (nuxt.options._prepare) {
      return null
    }

    throw createModuleError('core', 'WordPress URL is required. Set it in nuxt.config.ts or via WPNUXT_WORDPRESS_URL environment variable.')
  }
  if (config.wordpressUrl.endsWith('/')) {
    throw createModuleError('core', `WordPress URL should not have a trailing slash: ${config.wordpressUrl}`)
  }

  // Set runtimeConfig after validation (wordpressUrl is guaranteed to be set)
  nuxt.options.runtimeConfig.public.wordpressUrl = config.wordpressUrl
  nuxt.options.runtimeConfig.public.wpNuxt = {
    wordpressUrl: config.wordpressUrl,
    graphqlEndpoint: config.graphqlEndpoint,
    replaceLinks: config.replaceLinks ?? true,
    imageRelativePaths: config.imageRelativePaths ?? false,
    hasBlocks: hasNuxtModule('@wpnuxt/blocks'),
    cache: {
      enabled: config.cache?.enabled ?? true,
      maxAge: config.cache?.maxAge ?? 300,
      swr: config.cache?.swr ?? true
    }
  }

  return config
}

// =============================================================================
// GraphQL Middleware Options
// =============================================================================

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

async function setupServerOptions(nuxt: Nuxt, _resolver: Resolver, logger: ReturnType<typeof getLogger>) {
  const serverDir = nuxt.options.serverDir
  const targetPath = join(serverDir, 'graphqlMiddleware.serverOptions.ts')

  // Check if user already has a custom server options file
  if (existsSync(targetPath)) {
    logger.debug('Using existing graphqlMiddleware.serverOptions.ts from project')
    return
  }

  // Ensure server directory exists
  if (!existsSync(serverDir)) {
    await mkdir(serverDir, { recursive: true })
  }

  // Write WPNuxt's default server options
  await writeFile(targetPath, SERVER_OPTIONS_TEMPLATE)
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

async function setupClientOptions(nuxt: Nuxt, _resolver: Resolver, logger: ReturnType<typeof getLogger>) {
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
    await mkdir(appDir, { recursive: true })
  }

  // Write WPNuxt's default client options
  await writeFile(targetPath, CLIENT_OPTIONS_TEMPLATE)
  logger.debug('Created graphqlMiddleware.clientOptions.ts with WPNuxt defaults (preview mode support)')
}

// =============================================================================
// Trailing Slash Configuration
// =============================================================================

/**
 * Configure trailing slash handling to match WordPress URI format.
 *
 * WordPress always uses trailing slashes in URIs (e.g., /hello-world/).
 * This configuration ensures:
 * 1. Server-side redirects from /path to /path/ for consistent URLs
 * 2. Client-side navigation also uses trailing slashes
 *
 * This is critical for SSG caching to work correctly - the cache key
 * must be consistent between prerender time and runtime.
 */
function configureTrailingSlash(nuxt: Nuxt, logger: ReturnType<typeof getLogger>) {
  // Normalize to forward slashes for Windows compatibility - Nitro uses ESM import()
  // which requires forward slashes or file:// URLs, not Windows backslash paths
  const handlerPath = join(nuxt.options.buildDir, 'wpnuxt', 'trailing-slash-handler.ts').replace(/\\/g, '/')

  const handlerCode = `import { defineEventHandler, sendRedirect, getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Skip if:
  // - Already has trailing slash
  // - Is root path
  // - Is an API route
  // - Has a file extension (likely a static file)
  // - Is a Nuxt internal route (_nuxt, __nuxt)
  if (
    path.endsWith('/') ||
    path === '' ||
    path.startsWith('/api/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/__nuxt') ||
    path.includes('.')
  ) {
    return
  }

  // Redirect to trailing slash version
  return sendRedirect(event, path + '/' + url.search, 301)
})
`

  // Write the handler file before build starts
  nuxt.hook('build:before', async () => {
    await mkdir(dirname(handlerPath), { recursive: true })
    await writeFile(handlerPath, handlerCode)
    logger.debug('Created trailing slash handler at ' + handlerPath)
  })

  // Register the handler with Nitro
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - nitro:config hook exists at runtime but type availability varies
  nuxt.hook('nitro:config', (nitroConfig: NitroConfig) => {
    nitroConfig.handlers = nitroConfig.handlers || []
    nitroConfig.handlers.unshift({
      route: '/**',
      handler: handlerPath
    })
  })

  logger.debug('Configured trailing slash handling for WordPress URI compatibility')
}

// =============================================================================
// Vercel Configuration
// =============================================================================

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
  const opts = nuxt.options as unknown as NuxtOptionsWithNitro
  opts.nitro = opts.nitro || {}

  // Detect if we're building for Vercel
  const isVercel = process.env.VERCEL === '1' || opts.nitro.preset === 'vercel'

  if (isVercel) {
    logger.debug('Vercel deployment detected, applying recommended settings')

    // Enable native SWR for proper Vercel ISR handling
    // This fixes issues with GraphQL response data not being properly passed to the client
    opts.nitro.future = opts.nitro.future || {}
    if (opts.nitro.future.nativeSWR === undefined) {
      opts.nitro.future.nativeSWR = true
      logger.debug('Enabled nitro.future.nativeSWR for Vercel ISR compatibility')
    }

    // Ensure SSR is enabled for all routes (fixes catch-all route issues)
    // Users can override specific routes if needed
    opts.routeRules = opts.routeRules || {}
    if (!opts.routeRules['/**']) {
      opts.routeRules['/**'] = { ssr: true }
      logger.debug('Enabled SSR for all routes (routeRules[\'/**\'] = { ssr: true })')
    }
  }
}

// =============================================================================
// Module Registration
// =============================================================================

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
      },
      // Pass auth headers for schema download when token is configured
      ...(wpNuxtConfig.schemaAuthToken && {
        urlSchemaOptions: {
          headers: {
            Authorization: `Bearer ${wpNuxtConfig.schemaAuthToken}`
          }
        }
      })
    },
    experimental: {
      // Use improved query parameter encoding for better URL handling
      improvedQueryParamEncoding: true
    }
  })
}
