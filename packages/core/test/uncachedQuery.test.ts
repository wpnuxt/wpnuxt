import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApp, defineEventHandler, getRouterParam, setResponseHeader, toWebHandler } from 'h3'
import uncachedQuery from '../src/runtime/server/middleware/uncachedQuery'

// The handlers import these from Nitro; forward them to the globals each test stubs
vi.mock('nitropack/runtime', () => {
  const globals = globalThis as unknown as Record<string, ((...args: unknown[]) => unknown) | undefined>
  return {
    useRuntimeConfig: (...args: unknown[]) => globals.useRuntimeConfig!(...args)
  }
})

vi.mock('#wpnuxt-graphql-query-handler', () => ({
  default: defineEventHandler(event => ({ source: 'uncached', name: getRouterParam(event, 'name') }))
}))

// Stands in for the cached route handler that runs when the middleware passes the request on
const cachedRoute = defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 's-maxage=300')
  return { source: 'cached' }
})

function request(path: string, init: RequestInit = {}) {
  const app = createApp()
    .use(defineEventHandler((event) => {
      setResponseHeader(event, 'Vercel-Cache-Tag', 'wpnuxt')
    }))
    .use(uncachedQuery)
    .use(cachedRoute)
  return toWebHandler(app)(new Request(`http://localhost${path}`, init))
}

describe('uncached query middleware', () => {
  beforeEach(() => {
    vi.stubGlobal('useRuntimeConfig', () => ({ public: {} }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('leaves queries without preview or login to the cache', async () => {
    const response = await request('/api/wpnuxt/query/NodeByUri?uri=%2F')
    expect(await response.json()).toEqual({ source: 'cached' })
  })

  it.each([
    ['a preview flag', '/api/wpnuxt/query/ContentNodeById?id=1&__gqlc_preview=true', {}],
    ['a preview token', '/api/wpnuxt/query/ContentNodeById?id=1&__gqlc_previewToken=abc', {}],
    ['an Authorization header', '/api/wpnuxt/query/ContentNodeById?id=1', { authorization: 'Bearer abc' }],
    ['the auth cookie', '/api/wpnuxt/query/ContentNodeById?id=1', { cookie: 'wpnuxt-auth-token=abc' }]
  ])('runs a query with %s uncached', async (_, path, headers) => {
    const response = await request(path, { headers })
    expect(await response.json()).toEqual({ source: 'uncached', name: 'ContentNodeById' })
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(response.headers.get('vercel-cache-tag')).toBeNull()
  })

  it('uses the configured auth cookie name', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { wpNuxtAuth: { cookieName: 'custom-token' } } }))
    const custom = await request('/api/wpnuxt/query/Viewer', { headers: { cookie: 'custom-token=abc' } })
    expect(await custom.json()).toEqual({ source: 'uncached', name: 'Viewer' })
    const other = await request('/api/wpnuxt/query/Viewer', { headers: { cookie: 'unrelated=abc' } })
    expect(await other.json()).toEqual({ source: 'cached' })
  })

  it('ignores mutations and other routes', async () => {
    const mutation = await request('/api/wpnuxt/mutation/Login', { method: 'POST', headers: { authorization: 'Bearer abc' } })
    expect(await mutation.json()).toEqual({ source: 'cached' })
    const other = await request('/api/other?__gqlc_preview=true')
    expect(await other.json()).toEqual({ source: 'cached' })
  })
})
