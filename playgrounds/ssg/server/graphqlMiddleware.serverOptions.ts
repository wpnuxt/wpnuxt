import { defineGraphqlServerOptions } from '@wpnuxt/core/server-options'
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
        authorization = `Bearer ${authToken}`
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
    console.error(`[WPNuxt] GraphQL error in ${operationName} (${url}):`, error.message)
  }
})
