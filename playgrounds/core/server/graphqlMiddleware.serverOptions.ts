import { defineGraphqlServerOptions } from 'nuxt-graphql-middleware/server-options'
import { getHeader } from 'h3'

/**
 * Example: override WPNuxt's default server options.
 *
 * When this file exists in the main app, it takes priority over the defaults
 * provided by the WPNuxt layer (nuxt-graphql-middleware scans _layers in order,
 * first match wins). Users can use this pattern to customize request forwarding,
 * add custom headers, etc.
 *
 * This playground example demonstrates how to override — it forwards cookies and
 * the Authorization header, then adds an X-Playground header so you can verify
 * the override is active by inspecting outbound requests to WordPress. Note that
 * this does NOT reproduce the full WPNuxt default behavior: the WPNuxt default
 * also reads the @wpnuxt/auth cookie and promotes it to a Bearer token when no
 * Authorization header is present. Replicate that logic in your own override if
 * you rely on it.
 */
export default defineGraphqlServerOptions({
  async serverFetchOptions(event) {
    console.log('[LAYER-OVERRIDE-TEST] playground override is being used — main-app layer override works!')
    return {
      headers: {
        'Cookie': getHeader(event, 'cookie') || '',
        'Authorization': getHeader(event, 'authorization') || '',
        'X-Playground': 'core'
      }
    }
  }
})
