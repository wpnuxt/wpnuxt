import { defineGraphqlServerOptions } from '@wpnuxt/core/server-options'
import { getHeader } from 'h3'

/**
 * WPNuxt default server options for nuxt-graphql-middleware.
 *
 * This enables:
 * - Cookie forwarding for WordPress preview mode
 * - Authorization header forwarding for authenticated requests
 * - Consistent error logging
 *
 * Users can customize by creating their own server/graphqlMiddleware.serverOptions.ts
 */
export default defineGraphqlServerOptions({
  async serverFetchOptions(event, _operation, _operationName, _context) {
    return {
      headers: {
        // Forward WordPress auth cookies for previews
        Cookie: getHeader(event, 'cookie') || '',
        // Forward authorization header if present
        Authorization: getHeader(event, 'authorization') || ''
      }
    }
  },

  async onServerError(event, error, _operation, operationName) {
    const url = event.node.req.url || 'unknown'
    console.error(`[WPNuxt] GraphQL error in ${operationName} (${url}):`, error.message)
  }
})
