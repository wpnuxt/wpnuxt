import type { Ref } from 'vue'
import { useAsyncGraphqlQuery, useGraphqlMutation, useNuxtApp, watch, toValue } from '#imports'

/**
 * Payload for the `wpnuxt:query` runtime telemetry hook.
 */
export interface WPNuxtQueryHookPayload {
  queryName: string
  queryType: 'query' | 'mutation'
  variables: Record<string, unknown> | undefined
  durationMs: number
  status: 'success' | 'error'
  error?: Error
}

type UseAsyncGraphqlQuery = typeof useAsyncGraphqlQuery
type UseGraphqlMutation = typeof useGraphqlMutation
type NuxtAppLike = { callHook?: (name: string, ...args: unknown[]) => Promise<void> | void }

/**
 * Internal GraphQL client surface for @wpnuxt/core.
 *
 * Centralizes the integration with nuxt-graphql-middleware and emits the
 * `wpnuxt:query` telemetry hook on every completed fetch so user code can
 * wire Sentry, Datadog, OpenTelemetry, or custom logging without WPNuxt
 * depending on any of them. Cache hits never fire (pending stays false);
 * refresh/execute fire per attempt.
 *
 * Not part of the public API — exposed via the `#wpnuxt-internal` alias only
 * for generated mutation composables and the internal `useWPContent`
 * composable.
 */
export const wpQuery = ((...args: Parameters<UseAsyncGraphqlQuery>): ReturnType<UseAsyncGraphqlQuery> => {
  const [name, variables] = args
  const nuxtApp = useNuxtApp() as NuxtAppLike
  const result = useAsyncGraphqlQuery(...args)

  // Track a single fetch cycle: pending true → false fires the hook once.
  // Initial state with cache-hit has pending=false and never flips, so no hook.
  // Explicit refresh()/execute() re-enter the cycle and fire again per attempt.
  let wasPending = false
  let cycleStart = 0
  const pendingSource = (result as unknown as { pending: Ref<boolean> }).pending
  const errorSource = (result as unknown as { error?: Ref<unknown> }).error
  watch(
    pendingSource,
    (isPending: boolean) => {
      if (isPending) {
        wasPending = true
        cycleStart = performance.now()
        return
      }
      if (!wasPending) return
      wasPending = false
      const errorVal = errorSource?.value instanceof Error ? errorSource.value : undefined
      emitHook(nuxtApp, {
        queryName: String(name),
        queryType: 'query',
        variables: normalizeVariables(variables),
        durationMs: performance.now() - cycleStart,
        status: errorVal ? 'error' : 'success',
        ...(errorVal ? { error: errorVal } : {})
      })
    },
    { immediate: true }
  )

  return result
}) as unknown as UseAsyncGraphqlQuery

export const wpMutation = ((...args: Parameters<UseGraphqlMutation>): ReturnType<UseGraphqlMutation> => {
  const [name, variables] = args
  const nuxtApp = useNuxtApp() as NuxtAppLike
  const startTime = performance.now()
  const promise = useGraphqlMutation(...args)
  Promise.resolve(promise).then(
    () => emitHook(nuxtApp, {
      queryName: String(name),
      queryType: 'mutation',
      variables: normalizeVariables(variables),
      durationMs: performance.now() - startTime,
      status: 'success'
    }),
    (err: unknown) => emitHook(nuxtApp, {
      queryName: String(name),
      queryType: 'mutation',
      variables: normalizeVariables(variables),
      durationMs: performance.now() - startTime,
      status: 'error',
      error: err instanceof Error ? err : new Error(String(err))
    })
  )
  return promise
}) as unknown as UseGraphqlMutation

function normalizeVariables(variables: unknown): Record<string, unknown> | undefined {
  const value = toValue(variables)
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return undefined
}

function emitHook(nuxtApp: NuxtAppLike, payload: WPNuxtQueryHookPayload) {
  if (typeof nuxtApp?.callHook !== 'function') return
  const maybePromise = nuxtApp.callHook('wpnuxt:query', payload)
  if (maybePromise && typeof (maybePromise as PromiseLike<void>).then === 'function') {
    Promise.resolve(maybePromise).catch((err: unknown) => {
      if (import.meta.dev) {
        console.warn('[wpnuxt] wpnuxt:query hook handler threw', err)
      }
    })
  }
}
