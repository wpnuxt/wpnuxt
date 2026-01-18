/**
 * Composable to detect the current rendering mode.
 *
 * Useful for conditionally showing/hiding features that require
 * a server (like refresh buttons or dynamic queries) when running
 * in pure SSG static mode.
 */
export const useRenderingMode = () => {
  const nuxtApp = useNuxtApp()

  /**
   * Whether we're running from prerendered static files (SSG mode).
   * In this mode, there's no server API available for dynamic queries.
   */
  const isStaticMode = computed(() => {
    // In development, we always have a server
    if (import.meta.dev) {
      return false
    }
    // On server during prerender, we're generating static files
    if (import.meta.server && import.meta.prerender) {
      return true
    }
    // On client, check if we're running from prerendered static files
    // The payload contains prerenderedAt timestamp when page was prerendered
    if (import.meta.client) {
      // Check for prerenderedAt in payload (set during nuxt generate)
      const hasPrerenderedPayload = !!(nuxtApp.payload as Record<string, unknown>)?.prerenderedAt
      // Also check static.data which contains prerendered async data
      const hasStaticData = !!nuxtApp.static?.data && Object.keys(nuxtApp.static.data).length > 0
      return hasPrerenderedPayload || hasStaticData
    }
    return false
  })

  /**
   * Whether a server API is available for dynamic queries.
   * False in pure SSG mode, true in dev/SSR/hybrid modes.
   */
  const hasServerApi = computed(() => !isStaticMode.value)

  /**
   * Human-readable description of the current mode.
   */
  const modeDescription = computed(() => {
    if (import.meta.dev) return 'Development'
    if (isStaticMode.value) return 'Static (SSG)'
    return 'Server (SSR/Hybrid)'
  })

  return {
    isStaticMode,
    hasServerApi,
    modeDescription
  }
}
