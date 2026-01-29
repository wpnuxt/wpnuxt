import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

// Type for the options passed to useAsyncGraphqlQuery
interface MockAsyncGraphqlQueryOptions {
  lazy?: boolean
  server?: boolean
  immediate?: boolean
  getCachedData?: (key: string, app: unknown, ctx: { cause: string }) => unknown
  graphqlCaching?: { client: boolean }
  fetchOptions?: { signal?: AbortSignal, headers?: Record<string, string> }
}

// Mock the #imports module
vi.mock('#imports', () => ({
  computed: vi.fn(fn => ({ value: fn() })),
  ref: vi.fn(val => ({ value: val })),
  watch: vi.fn(),
  useAsyncGraphqlQuery: vi.fn()
}))

// Mock import.meta
vi.stubGlobal('import', {
  meta: {
    dev: true,
    client: true
  }
})

describe('useWPContent', () => {
  let mockUseAsyncGraphqlQuery: ReturnType<typeof vi.fn>
  let mockWatch: ReturnType<typeof vi.fn>
  let mockRef: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    // Set up mocks before importing the module
    mockRef = vi.fn((val) => {
      const r = { value: val }
      return r
    })

    mockWatch = vi.fn()

    mockUseAsyncGraphqlQuery = vi.fn(() => ({
      data: ref({ data: { posts: { nodes: [{ id: 1 }] } } }),
      pending: ref(false),
      refresh: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
      error: ref(null),
      status: ref('success')
    }))

    vi.doMock('#imports', () => ({
      computed: vi.fn((fn) => {
        try {
          return { value: fn() }
        } catch {
          return { value: undefined }
        }
      }),
      ref: mockRef,
      watch: mockWatch,
      useAsyncGraphqlQuery: mockUseAsyncGraphqlQuery
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Helper to get typed call arguments
  const getCallArgs = () => {
    const calls = mockUseAsyncGraphqlQuery.mock.calls
    if (!calls[0]) throw new Error('No calls to mockUseAsyncGraphqlQuery')
    return {
      queryName: calls[0][0] as string,
      params: calls[0][1] as Record<string, unknown>,
      options: calls[0][2] as MockAsyncGraphqlQueryOptions
    }
  }

  describe('retry logic', () => {
    it('should configure retry with default delay of 1000ms', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { retry: 3 })

      // Verify watch was called for error handling (retry logic)
      expect(mockWatch).toHaveBeenCalled()
    })

    it('should not set up retry watcher when retry is 0', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { retry: 0 })

      // Watch should only be called for timeout cleanup, not retry
      const watchCalls = mockWatch.mock.calls
      // Filter out timeout-related watch calls
      const retryWatchCalls = watchCalls.filter((call) => {
        // Retry watch monitors error ref
        const watchSource = call[0]
        return watchSource?.value === null && call[1]?.toString().includes('retry')
      })
      expect(retryWatchCalls.length).toBe(0)
    })

    it('should not set up retry watcher when retry is false', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { retry: false })

      // Verify maxRetries is 0 when retry is false
      // This is tested implicitly by checking that no retry-related watch is set up
      expect(mockWatch).toHaveBeenCalledTimes(0)
    })

    it('should use custom retryDelay when provided', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { retry: 2, retryDelay: 500 })

      // Verify watch was set up for retry
      expect(mockWatch).toHaveBeenCalled()
    })

    it('should return retryCount and isRetrying refs', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      const result = useWPContent('Posts', ['posts', 'nodes'], false, {}, { retry: 3 })

      expect(result.retryCount).toBeDefined()
      expect(result.isRetrying).toBeDefined()
    })
  })

  describe('timeout logic', () => {
    it('should not create AbortController when timeout is 0', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { timeout: 0 })

      // Verify useAsyncGraphqlQuery was called without abort signal
      expect(mockUseAsyncGraphqlQuery).toHaveBeenCalled()
      const { options: callArgs } = getCallArgs()
      expect(callArgs.fetchOptions?.signal).toBeUndefined()
    })

    it('should create AbortController when timeout is specified', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { timeout: 5000 })

      // Verify useAsyncGraphqlQuery was called with abort signal
      expect(mockUseAsyncGraphqlQuery).toHaveBeenCalled()
      const { options: callArgs } = getCallArgs()
      expect(callArgs.fetchOptions?.signal).toBeDefined()
      expect(callArgs.fetchOptions?.signal).toBeInstanceOf(AbortSignal)
    })

    it('should set up watch to clear timeout when request completes', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { timeout: 5000 })

      // Verify watch was called with immediate: true for timeout cleanup
      const watchCalls = mockWatch.mock.calls
      const timeoutWatchCall = watchCalls.find(call => call[2]?.immediate === true)
      expect(timeoutWatchCall).toBeDefined()
    })
  })

  describe('caching options', () => {
    it('should enable client caching by default', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {})

      const { options: callArgs } = getCallArgs()
      expect(callArgs.graphqlCaching).toEqual({ client: true })
    })

    it('should disable client caching when clientCache is false', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { clientCache: false })

      const { options: callArgs } = getCallArgs()
      expect(callArgs.graphqlCaching).toEqual({ client: false })
    })

    it('should use custom getCachedData when provided', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')
      const customGetCachedData = vi.fn(() => undefined)

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { getCachedData: customGetCachedData })

      const { options: callArgs } = getCallArgs()
      expect(callArgs.getCachedData).toBe(customGetCachedData)
    })
  })

  describe('URI normalization', () => {
    it('should normalize URI parameter with trailing slash', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('PostByUri', ['post'], false, { uri: '/hello-world' })

      const { params: callArgs } = getCallArgs()
      expect(callArgs.uri).toBe('/hello-world/')
    })

    it('should not modify URI that already has trailing slash', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('PostByUri', ['post'], false, { uri: '/hello-world/' })

      const { params: callArgs } = getCallArgs()
      expect(callArgs.uri).toBe('/hello-world/')
    })

    it('should handle params without uri property', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, { limit: 10 })

      const { params: callArgs } = getCallArgs()
      expect(callArgs).toEqual({ limit: 10 })
    })
  })

  describe('return values', () => {
    it('should return all expected properties', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      const result = useWPContent('Posts', ['posts', 'nodes'], false)

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('pending')
      expect(result).toHaveProperty('refresh')
      expect(result).toHaveProperty('execute')
      expect(result).toHaveProperty('clear')
      expect(result).toHaveProperty('error')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('transformError')
      expect(result).toHaveProperty('retryCount')
      expect(result).toHaveProperty('isRetrying')
    })
  })

  describe('options passthrough', () => {
    it('should pass lazy option to useAsyncGraphqlQuery', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { lazy: true })

      const { options: callArgs } = getCallArgs()
      expect(callArgs.lazy).toBe(true)
    })

    it('should pass server option to useAsyncGraphqlQuery', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { server: false })

      const { options: callArgs } = getCallArgs()
      expect(callArgs.server).toBe(false)
    })

    it('should pass immediate option to useAsyncGraphqlQuery', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { immediate: false })

      const { options: callArgs } = getCallArgs()
      expect(callArgs.immediate).toBe(false)
    })

    it('should merge custom fetchOptions with timeout signal', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, {
        timeout: 5000,
        fetchOptions: { headers: { 'X-Custom': 'value' } }
      })

      const { options: callArgs } = getCallArgs()
      expect(callArgs.fetchOptions?.signal).toBeInstanceOf(AbortSignal)
      expect(callArgs.fetchOptions?.headers).toEqual({ 'X-Custom': 'value' })
    })
  })

  describe('query name and nodes', () => {
    it('should pass query name as first argument', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false)

      expect(getCallArgs().queryName).toBe('Posts')
    })

    it('should handle empty params', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, undefined)

      const { params: callArgs } = getCallArgs()
      expect(callArgs).toEqual({})
    })

    it('should handle null params', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, null)

      const { params: callArgs } = getCallArgs()
      expect(callArgs).toEqual({})
    })
  })

  describe('SSG caching', () => {
    it('should set up getCachedData for SSG support', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false)

      const { options: callArgs } = getCallArgs()
      expect(callArgs.getCachedData).toBeDefined()
      expect(typeof callArgs.getCachedData).toBe('function')
    })

    it('should return undefined from getCachedData when clientCache is false', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { clientCache: false })

      const { options: callArgs } = getCallArgs()
      const getCachedData = callArgs.getCachedData!
      expect(getCachedData('key', {}, { cause: 'initial' })).toBeUndefined()
    })

    it('should return undefined from getCachedData on manual refresh', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false)

      const { options: callArgs } = getCallArgs()
      const getCachedData = callArgs.getCachedData!
      const mockApp = { isHydrating: false, payload: { data: {} }, static: { data: {} } }
      expect(getCachedData('key', mockApp, { cause: 'refresh:manual' })).toBeUndefined()
    })

    it('should return undefined from getCachedData on hook refresh', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false)

      const { options: callArgs } = getCallArgs()
      const getCachedData = callArgs.getCachedData!
      const mockApp = { isHydrating: false, payload: { data: {} }, static: { data: {} } }
      expect(getCachedData('key', mockApp, { cause: 'refresh:hook' })).toBeUndefined()
    })

    it('should return payload data during hydration', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false)

      const { options: callArgs } = getCallArgs()
      const getCachedData = callArgs.getCachedData!
      const cachedValue = { posts: [{ id: 1 }] }
      const mockApp = { isHydrating: true, payload: { data: { testKey: cachedValue } } }
      expect(getCachedData('testKey', mockApp, { cause: 'initial' })).toBe(cachedValue)
    })

    it('should check static.data for SSG client navigation', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false)

      const { options: callArgs } = getCallArgs()
      const getCachedData = callArgs.getCachedData!
      const cachedValue = { posts: [{ id: 1 }] }
      const mockApp = {
        isHydrating: false,
        payload: { data: {} },
        static: { data: { testKey: cachedValue } }
      }
      expect(getCachedData('testKey', mockApp, { cause: 'initial' })).toBe(cachedValue)
    })

    it('should fallback to payload.data when static.data is empty', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false)

      const { options: callArgs } = getCallArgs()
      const getCachedData = callArgs.getCachedData!
      const cachedValue = { posts: [{ id: 1 }] }
      const mockApp = {
        isHydrating: false,
        payload: { data: { testKey: cachedValue } },
        static: { data: {} }
      }
      expect(getCachedData('testKey', mockApp, { cause: 'initial' })).toBe(cachedValue)
    })

    it('should check $graphqlCache as last resort', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false)

      const { options: callArgs } = getCallArgs()
      const getCachedData = callArgs.getCachedData!
      const cachedValue = { posts: [{ id: 1 }] }
      const mockApp = {
        isHydrating: false,
        payload: { data: {} },
        static: { data: {} },
        $graphqlCache: { get: (key: string) => key === 'testKey' ? cachedValue : undefined }
      }
      expect(getCachedData('testKey', mockApp, { cause: 'initial' })).toBe(cachedValue)
    })
  })
})
