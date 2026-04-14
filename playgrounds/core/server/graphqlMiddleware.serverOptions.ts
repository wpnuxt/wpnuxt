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
 * This playground example reproduces the default cookie/authorization forwarding
 * and adds an X-Playground header so you can verify the override is active by
 * inspecting outbound requests to WordPress.
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
