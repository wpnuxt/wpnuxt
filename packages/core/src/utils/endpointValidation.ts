import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { parse, visit, print } from 'graphql'
import type { InterfaceTypeDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'

/**
 * Validate that the WordPress GraphQL endpoint is reachable.
 * Makes a simple introspection query to verify the endpoint responds correctly.
 * Optionally downloads the schema if it doesn't exist (needed for nuxt prepare).
 *
 * @param wordpressUrl - The WordPress site URL
 * @param graphqlEndpoint - The GraphQL endpoint path (default: /graphql)
 * @param options - Additional options
 * @param options.schemaPath - Path to save schema if downloading
 * @param options.authToken - Bearer token for authenticated introspection
 * @throws Error with helpful message if endpoint is not reachable
 */
export async function validateWordPressEndpoint(
  wordpressUrl: string,
  graphqlEndpoint: string = '/graphql',
  options: { schemaPath?: string, authToken?: string } = {}
): Promise<void> {
  const fullUrl = `${wordpressUrl}${graphqlEndpoint}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (options.authToken) {
      headers['Authorization'] = `Bearer ${options.authToken}`
    }

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: '{ __typename }'
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(
        `[wpnuxt:core] WordPress GraphQL endpoint returned HTTP ${response.status}.

URL: ${fullUrl}

Possible causes:
- The WordPress site is down or unreachable
- WPGraphQL plugin is not installed or activated
- The GraphQL endpoint path is incorrect (default: /graphql)

Check your wpNuxt.wordpressUrl configuration in nuxt.config.ts`
      )
    }

    // Try to parse response as JSON
    const data = await response.json()

    // Check if it's a valid GraphQL response
    if (!data || (typeof data !== 'object')) {
      throw new Error(
        `[wpnuxt:core] WordPress GraphQL endpoint returned invalid response.

URL: ${fullUrl}

The endpoint did not return valid JSON. Make sure WPGraphQL plugin is installed and activated.`
      )
    }

    // Check for GraphQL errors that might indicate WPGraphQL is not installed
    if (data.errors && !data.data) {
      const errorMessage = data.errors[0]?.message || 'Unknown error'
      throw new Error(
        `[wpnuxt:core] WordPress GraphQL endpoint returned an error: ${errorMessage}

URL: ${fullUrl}

Make sure WPGraphQL plugin is installed and activated on your WordPress site.`
      )
    }

    // Check WPGraphQL version compatibility
    // MediaDetails.filePath was introduced in WPGraphQL v1.32.0 (shipped alongside v2.0.0)
    // If it's missing, the WPGraphQL version is too old for WPNuxt v2
    await checkWPGraphQLVersion(fullUrl, headers)

    // If schemaPath is provided, (re)download it using get-graphql-schema.
    // Re-downloading each time keeps the file fresh so CPT discovery and
    // codegen see newly-registered WordPress types; callers that want a
    // cached schema should skip passing schemaPath.
    if (options.schemaPath) {
      try {
        const authFlag = options.authToken ? ` -h "Authorization=Bearer ${options.authToken}"` : ''
        execSync(`npx get-graphql-schema "${fullUrl}"${authFlag} > "${options.schemaPath}"`, {
          stdio: 'pipe',
          timeout: 60000 // 60 second timeout
        })
        // Patch the schema to fix WPGraphQL interface issues
        patchWPGraphQLSchema(options.schemaPath)
      } catch (err) {
        const error = err as Error & { stderr?: Buffer }
        throw new Error(
          `[wpnuxt:core] Failed to download GraphQL schema.

URL: ${fullUrl}
Error: ${error.stderr?.toString() || error.message}

Make sure WPGraphQL plugin is installed and activated on your WordPress site.`
        )
      }
    }
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof Error && error.message.startsWith('[wpnuxt:core]')) {
      throw error
    }

    // Handle network errors
    const err = error as Error & { code?: string, cause?: { code?: string } }
    const errorCode = err.code || err.cause?.code || ''

    if (err.name === 'AbortError') {
      throw new Error(
        `[wpnuxt:core] WordPress GraphQL endpoint timed out after 10 seconds.

URL: ${fullUrl}

The server did not respond in time. Check if the WordPress site is accessible.`
      )
    }

    if (errorCode === 'ENOTFOUND' || err.message?.includes('getaddrinfo')) {
      throw new Error(
        `[wpnuxt:core] WordPress site not found - DNS lookup failed.

URL: ${fullUrl}

The domain could not be resolved. Please check:
- The URL is spelled correctly (no typos)
- The domain exists and is properly configured
- Your network connection is working

Check your wpNuxt.wordpressUrl configuration in nuxt.config.ts`
      )
    }

    if (errorCode === 'ECONNREFUSED') {
      throw new Error(
        `[wpnuxt:core] Connection refused to WordPress site.

URL: ${fullUrl}

The server is not accepting connections. Check if the WordPress site is running.`
      )
    }

    // Generic network error
    throw new Error(
      `[wpnuxt:core] Failed to connect to WordPress GraphQL endpoint.

URL: ${fullUrl}
Error: ${err.message || 'Unknown error'}

Check your wpNuxt.wordpressUrl configuration in nuxt.config.ts`
    )
  }
}

/**
 * Check that the WPGraphQL version is compatible with WPNuxt v2.
 *
 * Uses introspection to check for `MediaDetails.filePath`, a field introduced
 * in WPGraphQL v1.32.0 (which shipped alongside v2.0.0). If it's missing,
 * the installed WPGraphQL version is too old.
 *
 * @param fullUrl - The full GraphQL endpoint URL
 * @param headers - Request headers (including auth if needed)
 * @throws Error if WPGraphQL version is too old
 */
async function checkWPGraphQLVersion(
  fullUrl: string,
  headers: Record<string, string>
): Promise<void> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: '{ __type(name: "MediaDetails") { fields { name } } }'
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) return // Skip check if request fails — endpoint validation already handles this

    const data = await response.json()

    // Detect "Public Introspection disabled" responses from WPGraphQL so we
    // don't misreport them as an outdated plugin version.
    const errorMessage: string = data?.errors?.[0]?.message || ''
    if (/introspection/i.test(errorMessage)) {
      throw new Error(
        `[wpnuxt:core] WPGraphQL Public Introspection is disabled on this endpoint.

URL: ${fullUrl}

WPNuxt needs introspection to validate the schema and generate types.

To fix:
- Enable "Enable Public Introspection" under WPGraphQL → Settings in the WordPress admin.
- Or provide authenticated credentials that are permitted to introspect the schema.

WPGraphQL error: ${errorMessage}`
      )
    }

    // If __type is missing without an introspection error, we can't reliably
    // tell whether the plugin is outdated or introspection is otherwise
    // blocked — skip rather than surface a misleading "too old" message.
    const type = data?.data?.__type
    if (!type) return

    const fields: Array<{ name: string }> = type.fields || []
    const hasFilePath = fields.some(f => f.name === 'filePath')

    if (!hasFilePath) {
      throw new Error(
        `[wpnuxt:core] WPGraphQL version is too old. WPNuxt v2 requires WPGraphQL >= 2.0.0.

URL: ${fullUrl}

The installed WPGraphQL version does not support required schema features.
Please update the WPGraphQL plugin on your WordPress site to version 2.0.0 or later.

Download: https://wordpress.org/plugins/wp-graphql/`
      )
    }
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof Error && error.message.startsWith('[wpnuxt:core]')) {
      throw error
    }
    // Silently ignore network errors — endpoint validation already handles those
  }
}

/**
 * Interfaces whose `implements` clauses should be removed from the schema.
 *
 * WPGraphQL uses interfaces like Connection and Edge with generic return types (Node),
 * but implementing types use more specific types (ContentNode, TermNode, etc.).
 * This is technically valid according to GraphQL spec (covariant return types),
 * but graphql-js validates strictly.
 */
const PROBLEMATIC_INTERFACES = new Set([
  'Connection',
  'Edge',
  'OneToOneConnection',
  'NodeWithEditorBlocks'
])

/**
 * Remove problematic interface implementations from a GraphQL schema string.
 *
 * Uses the GraphQL AST to safely filter out interfaces that cause graphql-js
 * validation errors due to covariant return types in WPGraphQL.
 *
 * @param schemaText - Raw GraphQL schema string
 * @returns Patched schema string with problematic interfaces removed
 */
export function patchSchemaText(schemaText: string): string {
  const ast = parse(schemaText)

  function filterInterfaces(node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode) {
    if (!node.interfaces?.length) return undefined
    const filtered = node.interfaces.filter(
      iface => !PROBLEMATIC_INTERFACES.has(iface.name.value)
    )
    if (filtered.length === node.interfaces.length) return undefined
    return { ...node, interfaces: filtered }
  }

  const patched = visit(ast, {
    ObjectTypeDefinition: filterInterfaces,
    InterfaceTypeDefinition: filterInterfaces
  })

  return print(patched)
}

/**
 * Patch the WPGraphQL schema file to fix interface implementation issues.
 *
 * @param schemaPath - Path to the schema.graphql file
 */
function patchWPGraphQLSchema(schemaPath: string): void {
  const schema = readFileSync(schemaPath, 'utf-8')
  writeFileSync(schemaPath, patchSchemaText(schema))
}
