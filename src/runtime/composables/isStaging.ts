import { useRuntimeConfig } from '#imports'

/**
 * Checks if the application is running in staging mode
 *
 * @returns Whether staging mode is enabled in the WPNuxt configuration
 *
 * @example
 * ```typescript
 * // Check staging mode
 * const staging = await isStaging()
 *
 * // Conditionally show staging banner
 * <div v-if="staging" class="staging-banner">Staging Environment</div>
 * ```
 */
const _isStaging = async () => {
  const config = useRuntimeConfig()
  return config.public.wpNuxt.staging
}
export const isStaging = _isStaging
