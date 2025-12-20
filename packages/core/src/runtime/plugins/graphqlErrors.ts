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

  nuxtApp.hook('nuxt-graphql-middleware:errors', (errors) => {
    if (import.meta.dev) {
      console.error('[WPNuxt] GraphQL errors:', errors)
    }
  })
})
