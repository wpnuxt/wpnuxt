/**
 * WPNuxt onInstall hook implementation.
 *
 * This module handles first-run setup tasks that create project files:
 * - .env and .env.example (WordPress URL configuration)
 * - .mcp.json (AI assistant configuration)
 * - .gitignore updates (ignore generated files)
 * - extend/queries/ folder (custom GraphQL queries)
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { consola } from 'consola'
import type { ConsolaInstance } from 'consola'
import { useLogger } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { validateWordPressUrl, atomicWriteFile } from './utils/index'

/**
 * Result from a setup function in the onInstall hook.
 * Used to track success/failure/skip status for the summary display.
 */
export interface SetupResult {
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
 * Main entry point for the onInstall hook.
 *
 * Orchestrates all first-run setup tasks and displays a summary.
 *
 * @param nuxt - Nuxt instance
 */
export async function runInstall(nuxt: Nuxt): Promise<void> {
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

// =============================================================================
// Environment Files Setup
// =============================================================================

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

// =============================================================================
// MCP Config Setup
// =============================================================================

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

// =============================================================================
// Gitignore Setup
// =============================================================================

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

// =============================================================================
// Queries Folder Setup
// =============================================================================

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
