import { defineEventHandler, getRouterParam, setCookie, sendRedirect, createError, getRequestURL } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * Initiates OAuth flow for a Headless Login provider (Google, GitHub, etc.)
 * Queries WordPress for the provider's authorization URL and redirects to it
 */
export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider')
  if (!provider) {
    throw createError({ statusCode: 400, message: 'Missing provider parameter' })
  }

  const config = useRuntimeConfig()
  const wordpressUrl = config.public.wordpressUrl as string | undefined
  const wpNuxtConfig = config.public.wpNuxt as { graphqlEndpoint?: string } | undefined
  const graphqlEndpoint = wpNuxtConfig?.graphqlEndpoint || '/graphql'

  if (!wordpressUrl) {
    throw createError({ statusCode: 500, message: 'WordPress URL not configured' })
  }

  // Query WordPress for available login clients
  const graphqlUrl = `${wordpressUrl}${graphqlEndpoint}`

  const response = await $fetch<{
    data?: {
      loginClients?: Array<{
        name: string
        provider: string
        authorizationUrl: string
        isEnabled: boolean
      }>
    }
    errors?: Array<{ message: string }>
  }>(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      query: `
        query LoginClients {
          loginClients {
            name
            provider
            authorizationUrl
            isEnabled
          }
        }
      `
    }
  }).catch((error) => {
    console.error('[WPNuxt Auth] Failed to fetch login clients:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch login providers from WordPress' })
  })

  if (response.errors?.length) {
    console.error('[WPNuxt Auth] GraphQL errors:', response.errors)
    throw createError({ statusCode: 500, message: response.errors[0]?.message || 'GraphQL error' })
  }

  const loginClients = response.data?.loginClients || []

  // Find the requested provider (case-insensitive match)
  const providerUpperCase = provider.toUpperCase()
  const loginClient = loginClients.find(
    client => client.provider === providerUpperCase && client.isEnabled
  )

  if (!loginClient) {
    throw createError({
      statusCode: 404,
      message: `Provider '${provider}' not found or not enabled. Available providers: ${loginClients.filter(c => c.isEnabled).map(c => c.name).join(', ')}`
    })
  }

  if (!loginClient.authorizationUrl) {
    throw createError({
      statusCode: 500,
      message: `Provider '${provider}' does not have an authorization URL configured`
    })
  }

  // Generate state parameter for CSRF protection
  const state = crypto.randomUUID()

  // Store state in cookie for validation on callback
  const isProduction = process.env.NODE_ENV === 'production'

  setCookie(event, 'wpnuxt-headless-login-state', state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/'
  })

  // Store provider name for callback to know which mutation to call
  setCookie(event, 'wpnuxt-headless-login-provider', providerUpperCase, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 600,
    path: '/'
  })

  // Build the authorization URL with state and redirect_uri
  const authUrl = new URL(loginClient.authorizationUrl)

  // Add state parameter
  authUrl.searchParams.set('state', state)

  // Build callback URL
  const requestUrl = getRequestURL(event)
  const callbackUrl = `${requestUrl.origin}/api/auth/provider/${provider}/callback`
  authUrl.searchParams.set('redirect_uri', callbackUrl)

  // Redirect to provider's OAuth page
  return sendRedirect(event, authUrl.toString())
})
