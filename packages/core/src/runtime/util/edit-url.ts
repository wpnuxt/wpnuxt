import { useRuntimeConfig } from '#imports'

/**
 * Get the WordPress admin URL of the edit screen for a post, page or custom
 * post type.
 *
 * It only builds the URL. WordPress asks for a login when the visitor has
 * none, so show the link only to logged-in editors (e.g. with
 * `useWPAuth().isAuthenticated` from `@wpnuxt/auth`).
 *
 * @param databaseId - The node's `databaseId`
 * @returns The edit URL, or `undefined` without a valid database ID
 */
export function getWPEditUrl(databaseId: number | null | undefined): string | undefined {
  if (!databaseId || !Number.isInteger(databaseId) || databaseId < 0) {
    return undefined
  }

  const { wordpressUrl } = (useRuntimeConfig().public as { wpNuxt: { wordpressUrl: string } }).wpNuxt
  return `${wordpressUrl}/wp-admin/post.php?post=${databaseId}&action=edit`
}
