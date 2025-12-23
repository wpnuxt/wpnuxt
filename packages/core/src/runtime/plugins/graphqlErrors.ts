import { defineNuxtPlugin, useNuxtApp } from 'nuxt/app'

/**
 * WPNuxt GraphQL Error Handler Plugin
 *
 * Listens to nuxt-graphql-middleware error events and logs errors in development mode.
 *
 * Users can add their own error handling (e.g., Sentry integration) by
 * creating a plugin that listens to the 'nuxt-graphql-middleware:errors' hook.
 *
 * @see https://nuxt-graphql-middleware.dulnan.net/composables/on-graphql-error
 */
export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()

  // Hook provided by nuxt-graphql-middleware for error handling
  // Type assertion needed as the hook is dynamically registered by the middleware
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(nuxtApp.hook as any)('nuxt-graphql-middleware:errors', (errors: unknown[]) => {
    if (import.meta.dev) {
      console.error('[WPNuxt] GraphQL errors:', errors)
    }
  })
})
