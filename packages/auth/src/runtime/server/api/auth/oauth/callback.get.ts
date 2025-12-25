import { defineEventHandler, getQuery, getCookie, setCookie, deleteCookie, sendRedirect, createError, getRequestURL } from 'h3'
import { useRuntimeConfig } from '#imports'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
  refresh_token?: string
  scope?: string
}

interface UserInfoResponse {
  // Standard OpenID Connect fields
  sub?: string | number
  id?: string | number
  ID?: string | number
  email?: string
  name?: string
  given_name?: string
  family_name?: string
  preferred_username?: string
  nickname?: string
  picture?: string
  // miniOrange specific fields
  username?: string
  first_name?: string
  last_name?: string
  display_name?: string
  user_login?: string
  avatar_url?: string
}

/**
 * Handles OAuth2 callback from WordPress OAuth server
 * Exchanges authorization code for tokens and stores them
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const publicConfig = config.public.wpNuxtAuth
  const privateConfig = config.wpNuxtAuthOAuth as {
    clientId: string
    clientSecret: string
    tokenEndpoint: string
    userInfoEndpoint: string
  } | undefined
  const wordpressUrl = config.public.wordpressUrl as string | undefined

  if (!wordpressUrl) {
    throw createError({ statusCode: 500, message: 'WordPress URL not configured' })
  }

  if (!privateConfig) {
    throw createError({ statusCode: 500, message: 'OAuth not configured' })
  }

  // Check for errors from OAuth provider
  if (query.error) {
    const errorDesc = query.error_description || query.error
    throw createError({ statusCode: 400, message: `OAuth error: ${errorDesc}` })
  }

  // Validate authorization code
  const code = query.code as string
  if (!code) {
    throw createError({ statusCode: 400, message: 'Missing authorization code' })
  }

  // Validate state parameter (CSRF protection)
  const state = query.state as string
  const storedState = getCookie(event, 'wpnuxt-oauth-state')

  if (!state || state !== storedState) {
    throw createError({ statusCode: 400, message: 'Invalid state parameter' })
  }

  // Clear state cookie
  deleteCookie(event, 'wpnuxt-oauth-state')

  // Build callback URL for token exchange
  const requestUrl = getRequestURL(event)
  const callbackUrl = `${requestUrl.origin}/api/auth/oauth/callback`

  // Exchange authorization code for tokens
  const tokenUrl = new URL(privateConfig.tokenEndpoint, wordpressUrl)

  const tokenResponse = await $fetch<TokenResponse>(tokenUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl,
      client_id: privateConfig.clientId,
      client_secret: privateConfig.clientSecret
    }).toString()
  }).catch((error) => {
    console.error('[WPNuxt Auth] Token exchange failed:', error)
    throw createError({ statusCode: 500, message: 'Failed to exchange authorization code' })
  })

  if (!tokenResponse.access_token) {
    throw createError({ statusCode: 500, message: 'No access token received' })
  }

  // Fetch user info
  const userInfoUrl = new URL(privateConfig.userInfoEndpoint, wordpressUrl)

  const userInfo = await $fetch<UserInfoResponse>(userInfoUrl.toString(), {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`
    }
  }).catch((error) => {
    console.error('[WPNuxt Auth] User info fetch failed:', error)
    // Continue without user info - tokens are still valid
    return null
  })

  // Store tokens in cookies
  const isProduction = process.env.NODE_ENV === 'production'

  setCookie(event, publicConfig.cookieName, tokenResponse.access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: tokenResponse.expires_in || publicConfig.tokenMaxAge,
    path: '/'
  })

  if (tokenResponse.refresh_token) {
    setCookie(event, publicConfig.refreshCookieName, tokenResponse.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: publicConfig.refreshTokenMaxAge,
      path: '/'
    })
  }

  // Store user info in a separate cookie (client-readable for hydration)
  if (userInfo) {
    // Map fields from either standard OpenID Connect or miniOrange format
    const userId = userInfo.sub || userInfo.id || userInfo.ID
    const firstName = userInfo.given_name || userInfo.first_name || ''
    const lastName = userInfo.family_name || userInfo.last_name || ''
    const displayName = userInfo.name || userInfo.display_name || `${firstName} ${lastName}`.trim()
    const username = userInfo.preferred_username || userInfo.username || userInfo.user_login || userInfo.nickname
    const avatarUrl = userInfo.picture || userInfo.avatar_url

    const userData = {
      id: userId?.toString() || '',
      databaseId: typeof userId === 'number' ? userId : Number.parseInt(userId?.toString() || '0', 10),
      email: userInfo.email,
      name: displayName,
      firstName,
      lastName,
      username,
      nickname: userInfo.nickname,
      avatar: avatarUrl ? { url: avatarUrl } : undefined
    }

    setCookie(event, 'wpnuxt-oauth-user', JSON.stringify(userData), {
      httpOnly: false, // Client needs to read this
      secure: isProduction,
      sameSite: 'lax',
      maxAge: tokenResponse.expires_in || publicConfig.tokenMaxAge,
      path: '/'
    })
  }

  // Redirect to configured login redirect path
  return sendRedirect(event, publicConfig.redirectOnLogin)
})
