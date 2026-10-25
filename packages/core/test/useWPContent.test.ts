import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

// Type for the options passed to useAsyncGraphqlQuery
interface MockAsyncGraphqlQueryOptions {
  lazy?: boolean
  server?: boolean
  immediate?: boolean
  getCachedData?: (key: string, app: unknown, ctx: { cause: string }) => unknown
  graphqlCaching?: { client: boolean }
  fetchOptions?: { timeout?: number, headers?: Record<string, string> }
}

// Mock the #imports module
vi.mock('#imports', () => ({
  computed: vi.fn(fn => ({ value: fn() })),
  ref: vi.fn(val => ({ value: val })),
  watch: vi.fn(),
  toValue: vi.fn(val => val),
  useAsyncGraphqlQuery: vi.fn(),
  useGraphqlMutation: vi.fn(),
  useNuxtApp: vi.fn(() => ({ callHook: vi.fn() })),
  useRuntimeConfig: vi.fn(() => ({ public: { wpNuxt: {} } }))
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
  let mockShowError: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    // Set up mocks before importing the module
    mockRef = vi.fn((val) => {
      const r = { value: val }
      return r
    })

    mockWatch = vi.fn()
    mockShowError = vi.fn()

    mockUseAsyncGraphqlQuery = vi.fn(() => {
      const result = {
        data: ref({ data: { posts: { nodes: [{ id: 1 }] } } }),
        pending: ref(false),
        refresh: vi.fn().mockResolvedValue(undefined),
        execute: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn(),
        error: ref(null),
        status: ref('success'),
        // useAsyncData returns a thenable (promise + refs)
        then: (fn?: (v: unknown) => unknown) => {
          const val = fn ? fn(result) : result
          return Promise.resolve(val)
        }
      }
      return result
    })

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
      createError: vi.fn((input: { statusCode: number, statusMessage: string, fatal?: boolean }) => Object.assign(new Error(input.statusMessage), input)),
      showError: mockShowError,
      toValue: vi.fn(val => val),
      useAsyncGraphqlQuery: mockUseAsyncGraphqlQuery,
      useGraphqlMutation: vi.fn(),
      useNuxtApp: vi.fn(() => ({ callHook: vi.fn() })),
      useRuntimeConfig: vi.fn(() => ({ public: { wpNuxt: {} } }))
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

      // wpQuery always registers a telemetry watch on `pending` with
      // { immediate: true }; filter that out and assert no retry-specific
      // watch (on the error ref) was registered.
      const retryWatchCalls = mockWatch.mock.calls.filter(call => !(call[2] as { immediate?: boolean } | undefined)?.immediate)
      expect(retryWatchCalls).toHaveLength(0)
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
    it('should not set a fetch timeout when timeout is 0', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { timeout: 0 })

      expect(mockUseAsyncGraphqlQuery).toHaveBeenCalled()
      const { options: callArgs } = getCallArgs()
      expect(callArgs.fetchOptions?.timeout).toBeUndefined()
    })

    it('should pass a per-request fetch timeout when timeout is specified', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { timeout: 5000 })

      // ofetch's `timeout` arms a fresh AbortController + timer per request, so
      // re-fetches stay protected and a fired timeout never poisons later
      // requests (#273). We assert the option is forwarded; the per-request
      // lifecycle itself is ofetch's responsibility.
      expect(mockUseAsyncGraphqlQuery).toHaveBeenCalled()
      const { options: callArgs } = getCallArgs()
      expect(callArgs.fetchOptions?.timeout).toBe(5000)
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

    it('should merge custom fetchOptions with the timeout option', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, {
        timeout: 5000,
        fetchOptions: { headers: { 'X-Custom': 'value' } }
      })

      const { options: callArgs } = getCallArgs()
      expect(callArgs.fetchOptions?.timeout).toBe(5000)
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

  describe('throwOnNotFound', () => {
    // Make the next query return the given response and error
    const mockQueryResult = (response: unknown, error: unknown = null) => {
      mockUseAsyncGraphqlQuery.mockImplementationOnce(() => {
        const result = {
          data: ref(response),
          pending: ref(false),
          refresh: vi.fn().mockResolvedValue(undefined),
          execute: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn(),
          error: ref(error),
          status: ref(error ? 'error' : 'success'),
          then: (fn?: (v: unknown) => unknown) => Promise.resolve().then(() => fn?.(result))
        }
        return result
      })
    }

    it('should throw a 404 when the query returns no content', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')
      mockQueryResult({ data: { nodeByUri: null } })

      await expect(useWPContent('NodeByUri', ['nodeByUri'], false, { uri: '/.env' }, { throwOnNotFound: true }))
        .rejects.toMatchObject({ statusCode: 404, fatal: true })
    })

    it('should resolve when the query returns content', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')
      mockQueryResult({ data: { nodeByUri: { id: 'abc' } } })

      const result = await useWPContent('NodeByUri', ['nodeByUri'], false, { uri: '/hello' }, { throwOnNotFound: true })

      expect(result.data.value).toEqual({ id: 'abc' })
    })

    it('should not turn a fetch error into a 404', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')
      mockQueryResult(null, new Error('403 Forbidden'))

      const result = await useWPContent('NodeByUri', ['nodeByUri'], false, { uri: '/hello' }, { throwOnNotFound: true })

      expect(result.data.value).toBeUndefined()
      expect(result.error.value).toBeInstanceOf(Error)
    })

    it('should not throw when the option is not set', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')
      mockQueryResult({ data: { nodeByUri: null } })

      const result = await useWPContent('NodeByUri', ['nodeByUri'], false, { uri: '/.env' })

      expect(result.data.value).toBeFalsy()
    })

    it('should not pass the option to useAsyncGraphqlQuery', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')

      useWPContent('Posts', ['posts', 'nodes'], false, {}, { throwOnNotFound: true })

      expect(getCallArgs().options).not.toHaveProperty('throwOnNotFound')
    })

    it('should show a 404 when a client re-fetch returns no content', async () => {
      const { useWPContent } = await import('../src/runtime/composables/useWPContent')
      mockQueryResult({ data: { nodeByUri: null } })

      const result = useWPContent('NodeByUri', ['nodeByUri'], false, { uri: '/.env' }, { throwOnNotFound: true })
      // wpQuery also watches pending (for query hooks); ours is registered last
      const pendingWatch = mockWatch.mock.calls.findLast(call => call[0] === result.pending)
      expect(pendingWatch).toBeDefined()
      pendingWatch![1](false)

      expect(mockShowError).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }))
    })
  })
})
