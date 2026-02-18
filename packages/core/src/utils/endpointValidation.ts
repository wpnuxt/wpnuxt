import { existsSync, readFileSync, writeFileSync } from 'node:fs'
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

    // If schemaPath is provided and schema doesn't exist, download it using get-graphql-schema
    if (options.schemaPath && !existsSync(options.schemaPath)) {
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
