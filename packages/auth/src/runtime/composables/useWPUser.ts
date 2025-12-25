import { computed, useState, useGraphqlQuery } from '#imports'
import type { WPUser } from '../types'

/**
 * Composable for accessing the current WordPress user
 *
 * Requires the Viewer GraphQL query in your queries folder:
 * query Viewer { viewer { id databaseId name email ... } }
 */
export function useWPUser() {
  const userState = useState<WPUser | null>('wpnuxt-user', () => null)
  const loadingState = useState<boolean>('wpnuxt-user-loading', () => false)
  const errorState = useState<string | null>('wpnuxt-user-error', () => null)

  /**
   * Fetch the current user from WordPress via GraphQL Viewer query
   * Note: Only works with password auth. OAuth tokens are not recognized by WPGraphQL.
   */
  async function fetchUser(): Promise<WPUser | null> {
    loadingState.value = true
    errorState.value = null

    try {
      const { data, errors } = await useGraphqlQuery('Viewer')

      const viewerData = data as { viewer?: WPUser | null } | null

      if (errors?.length) {
        errorState.value = errors[0]?.message || 'Failed to fetch user'
        loadingState.value = false
        return null
      }

      userState.value = viewerData?.viewer || null
      loadingState.value = false
      return userState.value
    } catch (error) {
      errorState.value = error instanceof Error ? error.message : 'Failed to fetch user'
      loadingState.value = false
      return null
    }
  }

  /**
   * Clear the current user state
   */
  function clearUser(): void {
    userState.value = null
    errorState.value = null
  }

  /**
   * Check if the user has a specific role
   */
  function hasRole(roleName: string): boolean {
    if (!userState.value?.roles?.nodes) {
      return false
    }
    return userState.value.roles.nodes.some(
      (role: { name: string }) => role.name.toLowerCase() === roleName.toLowerCase()
    )
  }

  /**
   * Check if the user is an administrator
   */
  function isAdmin(): boolean {
    return hasRole('administrator')
  }

  /**
   * Check if the user is an editor
   */
  function isEditor(): boolean {
    return hasRole('editor') || isAdmin()
  }

  /**
   * Get the user's display name
   */
  function getDisplayName(): string {
    if (!userState.value) {
      return ''
    }
    return userState.value.name
      || `${userState.value.firstName || ''} ${userState.value.lastName || ''}`.trim()
      || userState.value.username
      || ''
  }

  /**
   * Get the user's avatar URL
   */
  function getAvatarUrl(): string | null {
    return userState.value?.avatar?.url || null
  }

  return {
    // State
    user: computed(() => userState.value),
    isLoading: computed(() => loadingState.value),
    error: computed(() => errorState.value),

    // Methods
    fetchUser,
    clearUser,
    hasRole,
    isAdmin,
    isEditor,
    getDisplayName,
    getAvatarUrl
  }
}
