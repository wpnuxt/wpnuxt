import { defineEventHandler, setCookie, getRequestURL, setResponseStatus, setResponseHeader, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * Initiates OAuth2 authorization flow by redirecting to WordPress OAuth server
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const publicConfig = config.public.wpNuxtAuth
  const wordpressUrl = config.public.wordpressUrl as string | undefined

  if (!wordpressUrl) {
    throw createError({
      statusCode: 500,
      message: '[wpnuxt:auth] WordPress URL not configured'
    })
  }

  if (!publicConfig.providers.oauth.enabled) {
    throw createError({
      statusCode: 403,
      message: '[wpnuxt:auth] OAuth authentication is not enabled'
    })
  }

  // Generate state parameter for CSRF protection
  const state = crypto.randomUUID()

  // Store state in cookie for validation in callback
  setCookie(event, 'wpnuxt-oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/'
  })

  // Build the callback URL
  const requestUrl = getRequestURL(event)
  const callbackUrl = `${requestUrl.origin}/api/_wpnuxt-auth/oauth/callback`

  // Build authorization URL
  const authUrl = new URL(
    publicConfig.providers.oauth.authorizationEndpoint,
    wordpressUrl
  )
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', publicConfig.providers.oauth.clientId)
  authUrl.searchParams.set('redirect_uri', callbackUrl)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('scope', publicConfig.providers.oauth.scopes.join(' '))

  // Redirect to WordPress OAuth authorization page
  setResponseStatus(event, 302)
  setResponseHeader(event, 'Location', authUrl.toString())
  return ''
})
