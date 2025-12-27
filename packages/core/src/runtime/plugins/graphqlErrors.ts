import { defineNuxtPlugin, useNuxtApp } from '#imports'

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
  // Type comes from nuxt-graphql-middleware at runtime, using type assertion for module development
  nuxtApp.hook('nuxt-graphql-middleware:errors' as 'app:error', (errors: unknown) => {
    if (import.meta.dev) {
      console.error('[WPNuxt] GraphQL errors:', errors)
    }
  })
})
