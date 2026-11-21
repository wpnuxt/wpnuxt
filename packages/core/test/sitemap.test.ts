import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApp, defineEventHandler, toWebHandler } from 'h3'
import type { EventHandler } from 'h3'
import { fetchSitemapUrls, isExcluded, toSitemapUrls } from '../src/runtime/server/api/wpnuxt/sitemap.get'
import sitemapPlugin from '../src/runtime/server/plugins/sitemap'

const cacheOptions = vi.hoisted(() => {
  const captured: { current?: { name: string, maxAge: number, shouldBypassCache: () => boolean } } = {}
  const globals = globalThis as Record<string, unknown>
  globals.useRuntimeConfig = () => ({ public: { wpNuxt: { cache: { enabled: true, maxAge: 0, swr: true } } } })
  globals.defineCachedEventHandler = (handler: unknown, options: typeof captured.current) => {
    captured.current = options
    return handler
  }
  globals.defineNitroPlugin = (plugin: unknown) => plugin
  return captured
})

const ENDPOINT = 'https://wp.example.com/graphql'

function page(nodes: unknown[], endCursor: string | null = null) {
  return new Response(JSON.stringify({
    data: { connection: { pageInfo: { hasNextPage: endCursor !== null, endCursor }, nodes } }
  }), { headers: { 'Content-Type': 'application/json' } })
}

function requestBody(fetchMock: ReturnType<typeof vi.fn>, call: number) {
  return JSON.parse(fetchMock.mock.calls[call]![1].body)
}

describe('sitemap source', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('toSitemapUrls', () => {
    it('keeps the uri, marks modifiedGmt as UTC and adds the featured image', () => {
      expect(toSitemapUrls([{
        uri: '/events/test/',
        modifiedGmt: '2026-04-23T09:19:51',
        featuredImage: { node: { sourceUrl: 'https://wp.example.com/wp-content/uploads/a.jpg', altText: 'Alt' } }
      }])).toEqual([{
        loc: '/events/test/',
        lastmod: '2026-04-23T09:19:51Z',
        images: [{ loc: 'https://wp.example.com/wp-content/uploads/a.jpg', title: 'Alt' }]
      }])
    })

    it('leaves out optional fields that are missing', () => {
      expect(toSitemapUrls([
        { uri: '/about/', modifiedGmt: null, featuredImage: null },
        { uri: '/category/news/' },
        { uri: '/img/', featuredImage: { node: { sourceUrl: 'https://wp.example.com/b.jpg', altText: '' } } }
      ])).toEqual([
        { loc: '/about/' },
        { loc: '/category/news/' },
        { loc: '/img/', images: [{ loc: 'https://wp.example.com/b.jpg' }] }
      ])
    })

    it('skips nodes without a uri and excluded ones', () => {
      const nodes = [{ uri: null }, { uri: '' }, { uri: '/sponsors/nuxt/' }, { uri: '/private/' }, { uri: '/about/' }]
      expect(toSitemapUrls(nodes, ['/sponsors/*', '/private/'])).toEqual([{ loc: '/about/' }])
    })
  })

  describe('isExcluded', () => {
    it('matches exact URIs and prefixes with a trailing *', () => {
      expect(isExcluded('/private/', ['/private/'])).toBe(true)
      expect(isExcluded('/private/child/', ['/private/'])).toBe(false)
      expect(isExcluded('/sponsors/nuxt/', ['/sponsors/*'])).toBe(true)
      expect(isExcluded('/about/', ['/sponsors/*'])).toBe(false)
      expect(isExcluded('/about/')).toBe(false)
    })
  })

  describe('fetchSitemapUrls', () => {
    it('follows endCursor until the last page', async () => {
      fetchMock
        .mockResolvedValueOnce(page([{ uri: '/one/' }], 'cursor-1'))
        .mockResolvedValueOnce(page([{ uri: '/two/' }]))

      const urls = await fetchSitemapUrls(ENDPOINT)

      expect(urls).toEqual([{ loc: '/one/' }, { loc: '/two/' }])
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock.mock.calls[0]![0]).toBe(ENDPOINT)
      expect(requestBody(fetchMock, 0).variables).toEqual({ first: 100, after: null })
      expect(requestBody(fetchMock, 1).variables.after).toBe('cursor-1')
    })

    it('sends no auth or preview header', async () => {
      fetchMock.mockResolvedValueOnce(page([]))
      await fetchSitemapUrls(ENDPOINT)
      expect(fetchMock.mock.calls[0]![1].headers).toEqual({ 'Content-Type': 'application/json' })
    })

    it('passes postTypes as upper-case content types', async () => {
      fetchMock.mockResolvedValueOnce(page([]))
      await fetchSitemapUrls(ENDPOINT, { postTypes: ['post', 'PAGE'] })
      expect(requestBody(fetchMock, 0).variables.contentTypes).toEqual(['POST', 'PAGE'])
    })

    it('does not query terms by default', async () => {
      fetchMock.mockResolvedValueOnce(page([{ uri: '/one/' }]))
      await fetchSitemapUrls(ENDPOINT, { taxonomies: false })
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(requestBody(fetchMock, 0).query).toContain('contentNodes(')
    })

    it('adds the taxonomy archives with taxonomies: true', async () => {
      fetchMock
        .mockResolvedValueOnce(page([{ uri: '/one/' }]))
        .mockResolvedValueOnce(page([{ uri: '/category/news/' }, { uri: '/category/hidden/' }]))

      const urls = await fetchSitemapUrls(ENDPOINT, { taxonomies: true, exclude: ['/category/hidden/'] })

      expect(urls).toEqual([{ loc: '/one/' }, { loc: '/category/news/' }])
      expect(requestBody(fetchMock, 1).query).toContain('terms(')
    })

    it('throws when WordPress answers with an HTTP error', async () => {
      fetchMock.mockResolvedValueOnce(new Response('down', { status: 503 }))
      await expect(fetchSitemapUrls(ENDPOINT)).rejects.toMatchObject({ statusCode: 502 })
    })

    it('throws on a GraphQL error instead of returning a partial list', async () => {
      fetchMock
        .mockResolvedValueOnce(page([{ uri: '/one/' }], 'cursor-1'))
        .mockResolvedValueOnce(new Response(JSON.stringify({ errors: [{ message: 'Unknown argument' }] })))
      await expect(fetchSitemapUrls(ENDPOINT)).rejects.toMatchObject({
        statusCode: 502,
        statusMessage: expect.stringContaining('Unknown argument')
      })
    })
  })

  describe('handler', () => {
    it('returns the URLs for the configured WordPress site', async () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        public: { wpNuxt: { wordpressUrl: 'https://wp.example.com', graphqlEndpoint: '/graphql', sitemap: { exclude: ['/two/'] } } }
      }))
      fetchMock.mockResolvedValueOnce(page([{ uri: '/one/' }, { uri: '/two/' }]))
      const { default: handler } = await import('../src/runtime/server/api/wpnuxt/sitemap.get')

      const app = createApp().use(defineEventHandler(handler as EventHandler))
      const response = await toWebHandler(app)(new Request('http://localhost/api/_wpnuxt/sitemap'))

      expect(await response.json()).toEqual([{ loc: '/one/' }])
      expect(fetchMock.mock.calls[0]![0]).toBe(ENDPOINT)
    })

    it('uses a cache name the revalidate endpoint purges, and bypasses the cache for maxAge 0', () => {
      expect(cacheOptions.current?.name).toContain('wpnuxt')
      expect(cacheOptions.current?.shouldBypassCache()).toBe(true)
    })
  })

  describe('nitro plugin', () => {
    it('adds the endpoint to the sitemap sources', () => {
      const hooks: Record<string, (ctx: { sources: unknown[] }) => void> = {}
      const plugin = sitemapPlugin as unknown as (nitroApp: unknown) => void
      plugin({
        hooks: {
          hook: (name: string, fn: (ctx: { sources: unknown[] }) => void) => {
            hooks[name] = fn
          }
        }
      })

      const ctx = { sources: ['/existing'] }
      hooks['sitemap:sources']!(ctx)

      expect(ctx.sources).toEqual(['/existing', '/api/_wpnuxt/sitemap'])
    })
  })
})
