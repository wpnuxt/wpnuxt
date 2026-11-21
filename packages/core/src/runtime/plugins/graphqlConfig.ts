import { defineNuxtPlugin, useGraphqlState, useRequestHeaders, useRuntimeConfig } from '#imports'

// make sure that after deploying a new release (that changes the build hash), all requests to the server route won't be served from cache.
// https://nuxt-graphql-middleware.dulnan.net/configuration/composable.html#example-alter-the-request-using-interceptors

export default defineNuxtPlugin(() => {
  const state = useGraphqlState()

  if (!state) {
    return
  }

  // A hash generated at build time and passed in publicRuntimeConfig.
  const { buildHash } = useRuntimeConfig().public as { buildHash?: string }

  state.fetchOptions = {
    // During SSR the query request starts on the server: pass on the visitor's login, so previews and private content work
    headers: import.meta.server ? useRequestHeaders(['cookie', 'authorization']) : undefined,
    async onRequest({ options }: { options: { params?: Record<string, unknown> } }) {
      if (!options.params) {
        options.params = {}
      }
      options.params.hash = buildHash
    }
  }
})
