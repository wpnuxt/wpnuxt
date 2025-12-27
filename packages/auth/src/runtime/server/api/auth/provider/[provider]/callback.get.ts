import { defineEventHandler, getQuery, getRouterParam, getCookie, setCookie, deleteCookie, sendRedirect, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { logger } from '../../../../utils/logger'

interface LoginPayload {
  authToken: string | null
  authTokenExpiration: string | null
  refreshToken: string | null
  refreshTokenExpiration: string | null
  user: {
    id: string
    databaseId: number
    name: string
    email?: string
    firstName?: string
    lastName?: string
    username: string
    nickname?: string
    description?: string
    avatar?: { url: string }
    roles?: { nodes: Array<{ name: string }> }
  } | null
}

interface GraphQLResponse {
  data?: {
    login?: LoginPayload
  }
  errors?: Array<{ message: string }>
}

/**
 * Handles OAuth callback from external provider (Google, GitHub, etc.)
 * Exchanges authorization code for WPGraphQL JWT tokens via the login mutation
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const routeProvider = getRouterParam(event, 'provider')

  const config = useRuntimeConfig()
  const publicConfig = config.public.wpNuxtAuth
  const wordpressUrl = config.public.wordpressUrl as string | undefined
  const wpNuxtConfig = config.public.wpNuxt as { graphqlEndpoint?: string } | undefined
  const graphqlEndpoint = wpNuxtConfig?.graphqlEndpoint || '/graphql'

  if (!wordpressUrl) {
    throw createError({ statusCode: 500, message: 'WordPress URL not configured' })
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
  const storedState = getCookie(event, 'wpnuxt-headless-login-state')

  if (!state || state !== storedState) {
    throw createError({ statusCode: 400, message: 'Invalid state parameter' })
  }

  // Get stored provider
  const storedProvider = getCookie(event, 'wpnuxt-headless-login-provider')
  const provider = storedProvider || routeProvider?.toUpperCase()

  if (!provider) {
    throw createError({ statusCode: 400, message: 'Missing provider information' })
  }

  // Clear state and provider cookies
  deleteCookie(event, 'wpnuxt-headless-login-state')
  deleteCookie(event, 'wpnuxt-headless-login-provider')

  // Call WordPress GraphQL login mutation
  const graphqlUrl = `${wordpressUrl}${graphqlEndpoint}`

  const response = await $fetch<GraphQLResponse>(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      query: `
        mutation LoginWithProvider($provider: LoginProviderEnum!, $code: String!, $state: String) {
          login(input: {
            provider: $provider
            oauthResponse: {
              code: $code
              state: $state
            }
          }) {
            authToken
            authTokenExpiration
            refreshToken
            refreshTokenExpiration
            user {
              id
              databaseId
              name
              email
              firstName
              lastName
              username
              nickname
              description
              avatar {
                url
              }
              roles {
                nodes {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        provider,
        code,
        state
      }
    }
  }).catch((error) => {
    logger.error('Login mutation failed:', error)
    throw createError({ statusCode: 500, message: 'Failed to authenticate with WordPress' })
  })

  if (response.errors?.length) {
    logger.error('GraphQL errors:', response.errors)
    throw createError({ statusCode: 400, message: response.errors[0]?.message || 'Authentication failed' })
  }

  const loginData = response.data?.login

  if (!loginData?.authToken) {
    throw createError({ statusCode: 500, message: 'No auth token received from WordPress' })
  }

  // Store tokens in httpOnly cookies
  const isProduction = process.env.NODE_ENV === 'production'

  setCookie(event, publicConfig.cookieName, loginData.authToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: publicConfig.tokenMaxAge,
    path: '/'
  })

  if (loginData.refreshToken) {
    setCookie(event, publicConfig.refreshCookieName, loginData.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: publicConfig.refreshTokenMaxAge,
      path: '/'
    })
  }

  // Store user info in a client-readable cookie for hydration
  // Note: This is the full user data since we're using WPGraphQL JWT
  if (loginData.user) {
    const userData = {
      id: loginData.user.id,
      databaseId: loginData.user.databaseId,
      email: loginData.user.email,
      name: loginData.user.name,
      firstName: loginData.user.firstName,
      lastName: loginData.user.lastName,
      username: loginData.user.username,
      nickname: loginData.user.nickname,
      description: loginData.user.description,
      avatar: loginData.user.avatar,
      roles: loginData.user.roles
    }

    setCookie(event, 'wpnuxt-user', JSON.stringify(userData), {
      httpOnly: false, // Client needs to read this for hydration
      secure: isProduction,
      sameSite: 'lax',
      maxAge: publicConfig.tokenMaxAge,
      path: '/'
    })
  }

  // Redirect to configured login redirect path
  return sendRedirect(event, publicConfig.redirectOnLogin)
})
