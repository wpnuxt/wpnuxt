import { useAsyncGraphqlQuery, useGraphqlMutation } from '#imports'

/**
 * Internal GraphQL client surface for @wpnuxt/core.
 *
 * Centralizes the integration with nuxt-graphql-middleware so future upstream
 * changes can be absorbed in this single file rather than every call site.
 * Today these are direct re-exports; runtime instrumentation (e.g. telemetry
 * hooks) will be layered here.
 *
 * Not part of the public API — exposed via the `#wpnuxt-internal` alias only
 * for use by generated mutation composables. Consumers should keep using
 * `useWPContent`, `useWPConnection`, the generated query composables, or call
 * `useGraphqlMutation` directly (auto-imported via nuxt-graphql-middleware).
 */
export const wpQuery = useAsyncGraphqlQuery
export const wpMutation = useGraphqlMutation
