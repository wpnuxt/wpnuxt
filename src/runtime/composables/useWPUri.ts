import { useRuntimeConfig } from '#imports'

/**
 * Provides WordPress admin URL helpers
 *
 * @returns Object with WordPress admin URL properties and methods
 *
 * @example
 * ```typescript
 * const wp = useWPUri()
 *
 * // Get base WordPress URL
 * console.log(wp.base) // 'https://wordpress.example.com'
 *
 * // Get admin URL
 * console.log(wp.admin) // 'https://wordpress.example.com/wp-admin'
 *
 * // Get edit URL for a specific post
 * console.log(wp.postEdit('123')) // 'https://wordpress.example.com/wp-admin/post.php?post=123&action=edit'
 * ```
 */
const _useWPUri = () => {
  const config = useRuntimeConfig()
  const base = config.public.wpNuxt.wordpressUrl
  const admin = base + '/wp-admin'
  const pagesAdmin = base + '/wp-admin/edit.php?post_type=page'
  const postAdmin = base + '/wp-admin/edit.php?post_type=post'
  const settingsEdit = base + '/wp-admin/options-general.php'
  const postEdit = (path: string) => {
    if (path)
      return base + '/wp-admin/post.php?post=' + path + '&action=edit'
    else return postAdmin
  }

  return {
    base,
    admin,
    pagesAdmin,
    postAdmin,
    postEdit,
    settingsEdit
  }
}

export const useWPUri = _useWPUri
