import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApp, toWebHandler } from 'h3'
import uploadsHandler, { isSelfRedirect } from '../src/runtime/server/routes/uploads'

const WORDPRESS_URL = 'https://wordpress.example.com'
const FILE_PATH = '/wp-content/uploads/2026/10/missing.jpg'

describe('isSelfRedirect', () => {
  const requestUrl = new URL(`https://example.com${FILE_PATH}`)

  it('detects an absolute redirect to the requested URL', () => {
    expect(isSelfRedirect(requestUrl, 302, `https://example.com${FILE_PATH}`)).toBe(true)
  })

  it('detects a relative redirect to the requested path', () => {
    expect(isSelfRedirect(requestUrl, 301, FILE_PATH)).toBe(true)
  })

  it('ignores the protocol, which TLS termination can hide', () => {
    expect(isSelfRedirect(requestUrl, 302, `http://example.com${FILE_PATH}`)).toBe(true)
  })

  it('allows redirects to another host, such as a media offload CDN', () => {
    expect(isSelfRedirect(requestUrl, 302, `https://cdn.example.com${FILE_PATH}`)).toBe(false)
  })

  it('allows redirects to another path or query', () => {
    expect(isSelfRedirect(requestUrl, 302, '/wp-content/uploads/2026/10/moved.jpg')).toBe(false)
    expect(isSelfRedirect(requestUrl, 302, `${FILE_PATH}?v=2`)).toBe(false)
  })

  it('ignores non-redirect responses', () => {
    expect(isSelfRedirect(requestUrl, 200, `https://example.com${FILE_PATH}`)).toBe(false)
    expect(isSelfRedirect(requestUrl, 302, null)).toBe(false)
  })
})

describe('uploads proxy', () => {
  const fetchMock = vi.fn<typeof fetch>()

  function get(path: string) {
    const app = createApp().use(uploadsHandler)
    return toWebHandler(app)(new Request(`https://example.com${path}`, { headers: { host: 'example.com' } }))
  }

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { wpNuxt: { wordpressUrl: WORDPRESS_URL } } }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('proxies the upload from WordPress without following redirects', async () => {
    fetchMock.mockResolvedValue(new Response('image', { status: 200, headers: { 'content-type': 'image/jpeg' } }))

    const response = await get(`${FILE_PATH}?w=300`)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('image')
    const [target, init] = fetchMock.mock.calls[0]!
    expect(target).toBe(`${WORDPRESS_URL}${FILE_PATH}?w=300`)
    expect(init).toMatchObject({ redirect: 'manual' })
  })

  it('turns a redirect back to the requested URL into a 404', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 302, headers: { location: `https://example.com${FILE_PATH}` } }))

    const response = await get(FILE_PATH)

    expect(response.status).toBe(404)
    expect(response.headers.get('location')).toBeNull()
  })

  it('passes other redirects through to the client', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 302, headers: { location: `https://cdn.example.com${FILE_PATH}` } }))

    const response = await get(FILE_PATH)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(`https://cdn.example.com${FILE_PATH}`)
  })
})
