import { defineGraphqlClientOptions } from '@wpnuxt/core/client-options'
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
