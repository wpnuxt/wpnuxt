import { defu } from 'defu'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { consola } from 'consola'
import type { ConsolaInstance } from 'consola'
import { version } from '../package.json'
import { defineNuxtModule, addPlugin, createResolver, installModule, hasNuxtModule, addComponentsDir, addTemplate, addTypeTemplate, addImports, useLogger } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import type { NitroConfig } from 'nitropack'
import type { Import } from 'unimport'
import type { WPNuxtConfig } from './types/config'
import type { WPNuxtContext } from './types/queries'
import { generateWPNuxtComposables } from './generate'
import { getLogger, initLogger, mergeQueries, randHashGenerator, createModuleError, validateWordPressUrl, atomicWriteFile } from './utils/index'
import { validateWordPressEndpoint } from './utils/endpointValidation'

/**
 * Result from a setup function in the onInstall hook.
 * Used to track success/failure/skip status for the summary display.
 */
interface SetupResult {
  /** Name of the setup step (for logging) */
  name: string
  /** Whether the setup completed successfully */
  success: boolean
  /** Optional message to display in the summary */
  message?: string
  /** Whether this step was skipped (e.g., already configured) */
  skipped?: boolean
}

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
          { schemaPath }
        )
        logger.debug('Schema downloaded successfully')
      } else {
        // Schema exists - defer validation to ready hook (non-blocking)
        nuxt.hook('ready', async () => {
          try {
            await validateWordPressEndpoint(
              wpNuxtConfig.wordpressUrl!,
              wpNuxtConfig.graphqlEndpoint
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
    if (wpNuxtConfig.cache?.enabled !== false) {
      const maxAge = wpNuxtConfig.cache?.maxAge ?? 300
      const nitroOptions = nuxt.options as unknown as NuxtOptionsWithNitro
      nitroOptions.nitro = nitroOptions.nitro || {}
      nitroOptions.nitro.routeRules = nitroOptions.nitro.routeRules || {}
      nitroOptions.nitro.routeRules['/api/wpnuxt/**'] = {
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
      { name: 'useAsyncWPContent', as: 'useAsyncWPContent', from: resolver.resolve('./runtime/composables/useWPContent') },
      { name: 'getRelativeImagePath', as: 'getRelativeImagePath', from: resolver.resolve('./runtime/util/images') },
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
    // Create a shared logger for all setup functions
    const logger = useLogger('wpnuxt', {
      level: process.env.WPNUXT_DEBUG === 'true' ? 4 : 3
    })

    const results: SetupResult[] = []

    // Run env setup first (may prompt user for WordPress URL)
    results.push(await setupEnvFiles(nuxt, logger))

    // Run remaining setup tasks in parallel
    const parallel = await Promise.all([
      setupMcpConfig(nuxt, logger),
      setupGitignore(nuxt, logger),
      setupQueriesFolder(nuxt, logger)
    ])
    results.push(...parallel)

    // Display summary of what was set up
    displayInstallSummary(results, logger)
  }
})

/**
 * Displays a summary of the install process results.
 *
 * Shows a box with successful setup items and next steps.
 * Logs skipped items at debug level.
 *
 * @param results - Array of SetupResult from each setup function
 * @param logger - Consola logger instance
 */
function displayInstallSummary(results: SetupResult[], logger: ConsolaInstance): void {
  const successes = results.filter(r => r.success && !r.skipped)
  const skipped = results.filter(r => r.skipped)
  const failures = results.filter(r => !r.success)

  // Only show summary box if something was actually set up
  if (successes.length > 0) {
    const lines = [
      ...successes.map(r => `✓ ${r.message || r.name}`),
      '',
      'Next steps:',
      '  1. Ensure WPGraphQL is installed on WordPress',
      '  2. Run `pnpm dev` to start development',
      '',
      'Docs: https://wpnuxt.com'
    ]

    consola.box({
      title: 'WPNuxt Setup Complete',
      message: lines.join('\n')
    })
  }

  // Log skipped items at debug level
  if (skipped.length > 0) {
    logger.debug(`Skipped (already configured): ${skipped.map(r => r.name).join(', ')}`)
  }

  // Log failures as warnings (individual functions already logged details)
  if (failures.length > 0) {
    logger.debug(`Failed: ${failures.map(r => r.name).join(', ')}`)
  }
}

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
    throw createModuleError('core', 'WordPress URL is required. Set it in nuxt.config.ts or via WPNUXT_WORDPRESS_URL environment variable.')
  }
  if (config.wordpressUrl.endsWith('/')) {
    throw createModuleError('core', `WordPress URL should not have a trailing slash: ${config.wordpressUrl}`)
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
  const handlerPath = join(nuxt.options.buildDir, 'wpnuxt', 'trailing-slash-handler.ts')

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

/**
 * MCP (Model Context Protocol) configuration for AI assistants.
 *
 * Creates or updates .mcp.json in the project root to enable
 * Claude and other AI tools to use WPNuxt-specific capabilities.
 *
 * **File artifact:** `.mcp.json` in project root
 *
 * @param nuxt - Nuxt instance
 * @param logger - Consola logger instance
 * @returns SetupResult indicating success/failure/skip status
 */
const MCP_CONFIG = {
  wpnuxt: {
    type: 'http',
    url: 'https://wpnuxt.com/mcp'
  }
}

async function setupMcpConfig(nuxt: Nuxt, logger: ConsolaInstance): Promise<SetupResult> {
  const mcpPath = join(nuxt.options.rootDir, '.mcp.json')

  try {
    let config: { mcpServers?: Record<string, unknown> } = { mcpServers: {} }

    // Read existing config if it exists
    if (existsSync(mcpPath)) {
      const content = await readFile(mcpPath, 'utf-8')
      config = JSON.parse(content)
      config.mcpServers = config.mcpServers || {}

      // Check if wpnuxt is already configured
      if (config.mcpServers.wpnuxt) {
        logger.debug('MCP config already includes wpnuxt server')
        return { name: 'MCP config', success: true, skipped: true }
      }
    }

    // Add WPNuxt MCP server
    config.mcpServers = {
      ...config.mcpServers,
      ...MCP_CONFIG
    }

    await atomicWriteFile(mcpPath, JSON.stringify(config, null, 2) + '\n')
    return {
      name: 'MCP config',
      success: true,
      message: 'Created .mcp.json with WPNuxt MCP server'
    }
  } catch (error) {
    // Don't fail module installation if MCP setup fails
    const message = error instanceof Error ? error.message : String(error)
    logger.warn(`Failed to setup MCP configuration: ${message}`)
    return { name: 'MCP config', success: false, message }
  }
}

/** Template for .env.example file. */
const ENV_EXAMPLE_CONTENT = `# WPNuxt Configuration
# Required: Your WordPress site URL (must have WPGraphQL plugin installed)
WPNUXT_WORDPRESS_URL=https://your-wordpress-site.com

# Optional: Custom GraphQL endpoint (default: /graphql)
# WPNUXT_GRAPHQL_ENDPOINT=/graphql

# Optional: Enable debug mode for verbose logging
# WPNUXT_DEBUG=true
`

/**
 * Checks if the current environment is interactive (supports prompts).
 * Returns false in CI, test, or other non-interactive environments.
 */
function isInteractiveEnvironment(): boolean {
  return !(
    process.env.CI === 'true'
    || process.env.CI === '1'
    || process.env.VITEST === 'true'
    || process.env.TEST === 'true'
    || process.env.NODE_ENV === 'test'
  )
}

/**
 * Checks if WordPress URL is already configured in any location.
 *
 * @param nuxt - Nuxt instance
 * @param envPath - Path to .env file
 * @returns Object with hasUrl flag, source location, and current env content
 */
async function checkExistingEnvConfig(nuxt: Nuxt, envPath: string): Promise<{
  hasUrl: boolean
  source?: string
  envContent: string
}> {
  // Check 1: nuxt.config.ts (wpNuxt.wordpressUrl)
  const nuxtConfig = nuxt.options as { wpNuxt?: { wordpressUrl?: string } }
  if (nuxtConfig.wpNuxt?.wordpressUrl) {
    return { hasUrl: true, source: 'nuxt.config.ts', envContent: '' }
  }

  // Check 2: Environment variable already set
  if (process.env.WPNUXT_WORDPRESS_URL) {
    return { hasUrl: true, source: 'WPNUXT_WORDPRESS_URL env var', envContent: '' }
  }

  // Check 3: .env file
  if (existsSync(envPath)) {
    const envContent = await readFile(envPath, 'utf-8')
    if (/^WPNUXT_WORDPRESS_URL\s*=\s*.+/m.test(envContent)) {
      return { hasUrl: true, source: '.env file', envContent }
    }
    return { hasUrl: false, envContent }
  }

  return { hasUrl: false, envContent: '' }
}

/**
 * Environment variables setup.
 *
 * Prompts user for WordPress URL (in interactive environments) and creates
 * .env and .env.example files. Validates user input before saving.
 *
 * **File artifacts:**
 * - `.env` - User's environment variables (may be created or updated)
 * - `.env.example` - Template for required environment variables
 *
 * @param nuxt - Nuxt instance
 * @param logger - Consola logger instance
 * @returns SetupResult indicating success/failure/skip status
 */
async function setupEnvFiles(nuxt: Nuxt, logger: ConsolaInstance): Promise<SetupResult> {
  const envPath = join(nuxt.options.rootDir, '.env')
  const envExamplePath = join(nuxt.options.rootDir, '.env.example')

  try {
    // Check if WordPress URL is already configured anywhere
    const existingConfig = await checkExistingEnvConfig(nuxt, envPath)
    let envContent = existingConfig.envContent
    let urlConfigured = false

    if (existingConfig.hasUrl) {
      logger.debug(`WordPress URL already configured in ${existingConfig.source}`)
      urlConfigured = true
    } else if (isInteractiveEnvironment()) {
      // Prompt for WordPress URL
      consola.box({
        title: 'WPNuxt Setup',
        message: 'Configure your WordPress connection'
      })

      const wordpressUrl = await consola.prompt(
        'What is your WordPress site URL?',
        {
          type: 'text',
          placeholder: 'https://your-wordpress-site.com',
          initial: ''
        }
      )

      // User provided a URL (not cancelled or empty)
      if (wordpressUrl && typeof wordpressUrl === 'string' && wordpressUrl.trim()) {
        // Validate the URL
        const validation = validateWordPressUrl(wordpressUrl)

        if (!validation.valid) {
          logger.warn(`Invalid URL: ${validation.error}`)
          logger.info('Skipped WordPress URL configuration. Add WPNUXT_WORDPRESS_URL to your .env file later.')
        } else {
          const envLine = `WPNUXT_WORDPRESS_URL=${validation.normalizedUrl}\n`

          if (envContent) {
            envContent = envContent.trimEnd() + '\n\n' + envLine
          } else {
            envContent = envLine
          }

          await atomicWriteFile(envPath, envContent)
          logger.success(`WordPress URL saved to .env: ${validation.normalizedUrl}`)
          urlConfigured = true
        }
      } else {
        logger.info('Skipped WordPress URL configuration. Add WPNUXT_WORDPRESS_URL to your .env file later.')
      }
    } else {
      logger.debug('Non-interactive environment detected, skipping WordPress URL prompt')
    }

    // Always create/update .env.example as reference
    let exampleContent = ''
    let exampleUpdated = false

    if (existsSync(envExamplePath)) {
      exampleContent = await readFile(envExamplePath, 'utf-8')
      if (exampleContent.includes('WPNUXT_WORDPRESS_URL')) {
        logger.debug('.env.example already includes WPNuxt configuration')
      } else {
        exampleContent = exampleContent.trimEnd() + '\n\n' + ENV_EXAMPLE_CONTENT
        await atomicWriteFile(envExamplePath, exampleContent)
        exampleUpdated = true
      }
    } else {
      exampleContent = ENV_EXAMPLE_CONTENT
      await atomicWriteFile(envExamplePath, exampleContent)
      exampleUpdated = true
    }

    // Determine result based on what was done
    if (urlConfigured && exampleUpdated) {
      return {
        name: 'Environment files',
        success: true,
        message: 'Configured .env with WordPress URL'
      }
    } else if (urlConfigured) {
      return { name: 'Environment files', success: true, skipped: true }
    } else if (exampleUpdated) {
      return {
        name: 'Environment files',
        success: true,
        message: 'Created .env.example template'
      }
    } else {
      return { name: 'Environment files', success: true, skipped: true }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn(`Failed to setup environment files: ${message}`)
    return { name: 'Environment files', success: false, message }
  }
}

/**
 * Gitignore configuration.
 *
 * Ensures `.queries/` folder (generated merged queries) is ignored.
 * This folder is regenerated during build and should not be committed.
 *
 * **File artifact:** Modifies `.gitignore` in project root
 *
 * @param nuxt - Nuxt instance
 * @param logger - Consola logger instance
 * @returns SetupResult indicating success/failure/skip status
 */
async function setupGitignore(nuxt: Nuxt, logger: ConsolaInstance): Promise<SetupResult> {
  const gitignorePath = join(nuxt.options.rootDir, '.gitignore')

  try {
    let content = ''

    if (existsSync(gitignorePath)) {
      content = await readFile(gitignorePath, 'utf-8')

      // Check if .queries is already ignored
      if (content.includes('.queries')) {
        logger.debug('.gitignore already includes .queries')
        return { name: 'Gitignore', success: true, skipped: true }
      }

      // Append to existing file
      content = content.trimEnd() + '\n\n# WPNuxt generated files\n.queries/\n'
    } else {
      content = '# WPNuxt generated files\n.queries/\n'
    }

    await atomicWriteFile(gitignorePath, content)
    return {
      name: 'Gitignore',
      success: true,
      message: 'Added .queries/ to .gitignore'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn(`Failed to setup .gitignore: ${message}`)
    return { name: 'Gitignore', success: false, message }
  }
}

/** README content for the extend/queries/ folder. */
const QUERIES_README = `# Custom GraphQL Queries

Place your custom \`.gql\` or \`.graphql\` files here to extend or override the default WPNuxt queries.

## How it works

1. Files here are merged with WPNuxt's default queries during build
2. If a file has the same name as a default query, yours will override it
3. New files will generate new composables automatically

## Example

Create a file \`CustomPosts.gql\`:

\`\`\`graphql
query CustomPosts($first: Int = 10) {
  posts(first: $first) {
    nodes {
      id
      title
      date
      # Add your custom fields here
    }
  }
}
\`\`\`

This generates \`useCustomPosts()\` and \`useAsyncCustomPosts()\` composables.

## Available Fragments

You can use these fragments from WPNuxt's defaults:
- \`...Post\` - Standard post fields
- \`...Page\` - Standard page fields
- \`...ContentNode\` - Common content fields
- \`...FeaturedImage\` - Featured image with sizes

## Documentation

See https://wpnuxt.com/guide/custom-queries for more details.
`

/**
 * Creates `extend/queries/` folder with a README explaining how to use it.
 * This folder is for user-created custom GraphQL queries that extend or
 * override the default WPNuxt queries. Unlike `.queries/` (which is generated
 * and gitignored), `extend/queries/` should be committed to version control.
 *
 * **File artifacts:**
 * - `extend/queries/` directory
 * - `extend/queries/README.md` with usage instructions
 *
 * @param nuxt - Nuxt instance
 * @param logger - Consola logger instance
 * @returns SetupResult indicating success/failure/skip status
 */
async function setupQueriesFolder(nuxt: Nuxt, logger: ConsolaInstance): Promise<SetupResult> {
  const queriesPath = join(nuxt.options.rootDir, 'extend', 'queries')
  const readmePath = join(queriesPath, 'README.md')

  try {
    // Check if README already exists (indicates setup was done)
    if (existsSync(readmePath)) {
      logger.debug('extend/queries/ folder already exists')
      return { name: 'Queries folder', success: true, skipped: true }
    }

    // Create the folder
    await mkdir(queriesPath, { recursive: true })

    // Add README
    await atomicWriteFile(readmePath, QUERIES_README)

    return {
      name: 'Queries folder',
      success: true,
      message: 'Created extend/queries/ for custom GraphQL queries'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn(`Failed to setup extend/queries/ folder: ${message}`)
    return { name: 'Queries folder', success: false, message }
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
