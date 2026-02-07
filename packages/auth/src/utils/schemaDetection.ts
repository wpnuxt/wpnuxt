import { existsSync, readFileSync } from 'node:fs'

/**
 * Detected authentication capabilities from the GraphQL schema
 */
export interface AuthSchemaCapabilities {
  /** Whether the Headless Login plugin is installed (has loginClients query) */
  hasHeadlessLogin: boolean
  /** Whether password authentication is available (has login mutation) */
  hasPasswordAuth: boolean
  /** Whether token refresh is available */
  hasRefreshToken: boolean
  /** List of detected OAuth providers from LoginProviderEnum */
  detectedProviders: string[]
}

/**
 * Detect authentication capabilities from the GraphQL schema file.
 * Uses simple string/regex matching to avoid heavy GraphQL parsing dependencies.
 *
 * @param schemaPath - Path to the schema.graphql file
 * @returns Detected capabilities or null if schema doesn't exist
 */
export function detectAuthCapabilities(schemaPath: string): AuthSchemaCapabilities | null {
  if (!existsSync(schemaPath)) {
    return null
  }

  let schemaContent: string
  try {
    schemaContent = readFileSync(schemaPath, 'utf-8')
  } catch {
    return null
  }

  if (!schemaContent || schemaContent.length < 100) {
    return null
  }

  // Check for loginClients query (indicates Headless Login plugin)
  const hasHeadlessLogin = /loginClients\s*[:[(]/.test(schemaContent)

  // Check for login mutation
  const hasPasswordAuth = /\blogin\s*\(/.test(schemaContent) && /LoginInput/.test(schemaContent)

  // Check for refreshToken mutation
  const hasRefreshToken = /refreshToken\s*\(/.test(schemaContent)

  // Extract providers from LoginProviderEnum
  const detectedProviders: string[] = []
  const enumMatch = schemaContent.match(/enum\s+LoginProviderEnum\s*\{([^}]+)\}/)
  if (enumMatch?.[1]) {
    const enumBody = enumMatch[1]
    // Match enum values (typically uppercase identifiers)
    const providerMatches = enumBody.match(/\b[A-Z][A-Z0-9_]+\b/g)
    if (providerMatches) {
      detectedProviders.push(...providerMatches)
    }
  }

  return {
    hasHeadlessLogin,
    hasPasswordAuth,
    hasRefreshToken,
    detectedProviders
  }
}

/**
 * Validate that the schema has required auth capabilities.
 * Throws an error with helpful instructions if validation fails.
 *
 * @param schemaPath - Path to the schema.graphql file
 * @param options - Validation options
 * @param options.requirePassword - Whether password auth is required
 * @param options.requireHeadlessLogin - Whether headless login providers are required
 */
export function validateAuthSchema(
  schemaPath: string,
  options: {
    requirePassword?: boolean
    requireHeadlessLogin?: boolean
  } = {}
): void {
  const capabilities = detectAuthCapabilities(schemaPath)

  if (capabilities === null) {
    throw new Error(
      `[wpnuxt:auth] Cannot validate GraphQL schema - file not found or unreadable.

Schema path: ${schemaPath}

Make sure @wpnuxt/core is loaded before @wpnuxt/auth in your nuxt.config.ts modules,
and that 'downloadSchema' is enabled (the default).

To fix this, run: pnpm dev:prepare`
    )
  }

  // Check for Headless Login plugin
  if (!capabilities.hasHeadlessLogin) {
    throw new Error(
      `[wpnuxt:auth] Headless Login for WPGraphQL plugin not detected.

The @wpnuxt/auth module requires this WordPress plugin for authentication.
Your WordPress GraphQL schema is missing the required 'loginClients' query.

To fix this:
1. Install the plugin: https://github.com/AxeWP/wp-graphql-headless-login
2. Configure at least one authentication provider in WordPress admin
3. Run 'pnpm dev:prepare' to refresh the GraphQL schema

To disable @wpnuxt/auth, remove it from your nuxt.config.ts modules.`
    )
  }

  // Check for password auth if required
  if (options.requirePassword && !capabilities.hasPasswordAuth) {
    throw new Error(
      `[wpnuxt:auth] Password authentication not available in GraphQL schema.

The 'login' mutation is missing from your WordPress GraphQL schema.
Make sure Headless Login for WPGraphQL is properly configured with PASSWORD provider enabled.`
    )
  }

  // Check for headless login providers if required
  if (options.requireHeadlessLogin && capabilities.detectedProviders.length === 0) {
    throw new Error(
      `[wpnuxt:auth] No OAuth providers detected in GraphQL schema.

Headless Login is installed but no providers are configured.
Configure OAuth providers (Google, GitHub, etc.) in WordPress admin under:
GraphQL > Headless Login > Client Settings`
    )
  }
}
