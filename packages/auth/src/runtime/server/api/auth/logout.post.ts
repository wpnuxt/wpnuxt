import { defineEventHandler, deleteCookie } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * Server-side logout endpoint that clears all auth cookies
 * Required because OAuth sets httpOnly cookies that can't be cleared client-side
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig().public.wpNuxtAuth

  // Clear auth token cookie
  deleteCookie(event, config.cookieName, {
    path: '/'
  })

  // Clear refresh token cookie
  deleteCookie(event, config.refreshCookieName, {
    path: '/'
  })

  // Clear OAuth user data cookie
  deleteCookie(event, 'wpnuxt-oauth-user', {
    path: '/'
  })

  // Clear OAuth state cookie (if exists)
  deleteCookie(event, 'wpnuxt-oauth-state', {
    path: '/'
  })

  return { success: true }
})
