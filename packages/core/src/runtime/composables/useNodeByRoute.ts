import type { ComputedRef } from 'vue'
import type { useNodeByUri } from '#wpnuxt'
import { computed, useRoute } from '#imports'
import { getPreviewId } from '../util/preview'
import { useWPContent } from './useWPContent'
import type { WPContentOptions } from './useWPContent'

type NodeByRouteResult = ReturnType<typeof useNodeByUri> & {
  /** Whether the node was fetched by database ID because the URL is a WordPress preview link */
  isPreview: ComputedRef<boolean>
}

/**
 * Fetches the WordPress node for the current route, for use in a catch-all page.
 *
 * - Normal request: looks the node up by `route.path` (the `NodeByUri` query)
 *   and re-fetches when the path changes.
 * - Preview request (`?preview=true` with `preview_id`, `p` or `page_id`):
 *   looks the node up by database ID (the `ContentNodeById` query). A draft has
 *   no URI yet, so it can't be found by path. Preview requests skip the client
 *   cache and never throw a 404: without a valid login WordPress returns
 *   nothing, and the app can show a login hint instead.
 *
 * The mode is decided when the composable is called. Nuxt remounts a catch-all
 * page when the path changes, so each page gets the right mode.
 *
 * @param options - The usual content options. `throwOnNotFound` only applies to normal requests.
 *
 * @example
 * ```typescript
 * const { data: node, isPreview } = await useNodeByRoute({ throwOnNotFound: true })
 * ```
 */
export function useNodeByRoute(options?: WPContentOptions): NodeByRouteResult {
  const route = useRoute()
  const previewId = getPreviewId(route.query)

  const isPreview = computed(() => Boolean(previewId))

  const result = previewId
    ? useWPContent<{ id: string }>(
        'ContentNodeById',
        ['contentNode'],
        false,
        { id: previewId },
        { ...options, clientCache: false, throwOnNotFound: false }
      )
    : useWPContent<{ uri: string }>(
        'NodeByUri',
        ['nodeByUri'],
        false,
        () => ({ uri: route.path }),
        options
      )

  // useWPContent returns a promise that also carries the result fields. Add
  // isPreview to both, so it is there with and without `await`.
  const promise = result.then(resolved => ({ ...resolved, isPreview }))
  // Without `await` nobody handles a 404 rejection; keep it from surfacing as unhandled
  promise.then(undefined, () => {})
  return Object.assign(promise, { ...result, isPreview }) as unknown as NodeByRouteResult
}
