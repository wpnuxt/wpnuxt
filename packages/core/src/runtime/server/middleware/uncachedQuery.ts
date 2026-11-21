import { defineEventHandler, getCookie, getHeader, getQuery, removeResponseHeader, setResponseHeader } from 'h3'
import type { H3Event } from 'h3'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useRuntimeConfig: (event?: any) => any

const QUERY_ROUTE = /\/api\/wpnuxt\/query\/([^/?]+)/

/**
 * Whether a GraphQL query request carries a preview or a login.
 * Nitro's route cache only passes the headers listed in `varies` to the handler,
 * so these requests would reach WordPress without auth, and share one cached response.
 */
export function needsUncachedQuery(event: H3Event, cookieName: string): boolean {
  const query = getQuery(event)
  return query.__gqlc_preview === 'true'
    || !!query.__gqlc_previewToken
    || !!getHeader(event, 'authorization')
    || !!getCookie(event, cookieName)
}

// Runs preview and authenticated queries with nuxt-graphql-middleware's own handler, outside the route cache
export default defineEventHandler(async (event) => {
  const name = event.method === 'GET' ? event.path.match(QUERY_ROUTE)?.[1] : undefined
  if (!name) return

  const cookieName = useRuntimeConfig(event).public.wpNuxtAuth?.cookieName || 'wpnuxt-auth-token'
  if (!needsUncachedQuery(event, cookieName)) return

  event.context.params = { ...event.context.params, name: decodeURIComponent(name) }
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  removeResponseHeader(event, 'Vercel-CDN-Cache-Control')
  removeResponseHeader(event, 'Vercel-Cache-Tag')

  const { default: queryHandler } = await import('#wpnuxt-graphql-query-handler')
  return queryHandler(event)
})
