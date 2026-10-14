import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApp, toWebHandler } from 'h3'
import { createStorage, prefixStorage } from 'unstorage'
import revalidateHandler from '../src/runtime/server/api/wpnuxt/revalidate.post'

const SECRET = 'test-secret'

// Keys in the format Nitro's cachedEventHandler writes them:
// <group>:<name>:<first 16 escaped path chars>.<hash>.json
const ROUTE_KEY = 'cache:nitro:routes:wpnuxt:apiwpnuxtqueryPo.abc123.json'
const ROUTE_KEY_LONG_BASE_URL = 'cache:nitro:routes:wpnuxt:frontendapiwpnux.def456.json'
const HANDLER_KEY = 'cache:nitro:handlers:_:apiwpnuxtqueryPa.ghi789.json'
const OTHER_ROUTE_KEY = 'cache:nitro:routes:_:apiproducts.jkl012.json'

describe('revalidate endpoint', () => {
  let storage: ReturnType<typeof createStorage>

  function post(body: unknown) {
    const app = createApp().use(revalidateHandler)
    return toWebHandler(app)(new Request('http://localhost/api/_wpnuxt/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }))
  }

  beforeEach(async () => {
    storage = createStorage()
    await Promise.all([ROUTE_KEY, ROUTE_KEY_LONG_BASE_URL, HANDLER_KEY, OTHER_ROUTE_KEY]
      .map(key => storage.setItem(key, { value: 'cached' })))
    vi.stubGlobal('useStorage', (base: string) => prefixStorage(storage, base))
    vi.stubGlobal('useRuntimeConfig', () => ({ wpNuxtRevalidateSecret: SECRET }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('purges wpnuxt entries from the route and handler cache', async () => {
    const response = await post({ secret: SECRET })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true, purged: 3, vercelPurged: false })
    expect(await storage.hasItem(ROUTE_KEY)).toBe(false)
    expect(await storage.hasItem(ROUTE_KEY_LONG_BASE_URL)).toBe(false)
    expect(await storage.hasItem(HANDLER_KEY)).toBe(false)
    expect(await storage.hasItem(OTHER_ROUTE_KEY)).toBe(true)
  })

  it('rejects an invalid secret without purging', async () => {
    const response = await post({ secret: 'wrong' })

    expect(response.status).toBe(401)
    expect(await storage.getKeys()).toHaveLength(4)
  })
})
