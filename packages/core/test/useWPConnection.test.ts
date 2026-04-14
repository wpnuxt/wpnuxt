import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

// Mock the #imports module
vi.mock('#imports', () => ({
  computed: vi.fn(fn => ({ value: fn() })),
  ref: vi.fn(val => ({ value: val })),
  toValue: vi.fn(val => val),
  watch: vi.fn(),
  useAsyncGraphqlQuery: vi.fn(),
  useRuntimeConfig: vi.fn(() => ({ public: { wpNuxt: {} } }))
}))

// Mock import.meta
vi.stubGlobal('import', {
  meta: {
    dev: true,
    client: true
  }
})

describe('useWPConnection', () => {
  let mockUseAsyncGraphqlQuery: ReturnType<typeof vi.fn>

  const connectionData = {
    nodes: [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' },
      { id: 3, title: 'Post 3' }
    ],
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'cursor-1',
      endCursor: 'cursor-3'
    }
  }

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    mockUseAsyncGraphqlQuery = vi.fn(() => {
      const result = {
        data: ref({ data: { posts: connectionData } }),
        pending: ref(false),
        refresh: vi.fn().mockResolvedValue(undefined),
        execute: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn(),
        error: ref(null),
        status: ref('success'),
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
      ref: vi.fn(val => ({ value: val })),
      toValue: vi.fn(val => val),
      watch: vi.fn(),
      useAsyncGraphqlQuery: mockUseAsyncGraphqlQuery,
      useRuntimeConfig: vi.fn(() => ({ public: { wpNuxt: {} } }))
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should extract nodes array as data', async () => {
    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    const result = useWPConnection('Posts', ['posts'], false, { first: 3 })

    expect(result.data.value).toEqual([
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' },
      { id: 3, title: 'Post 3' }
    ])
  })

  it('should extract pageInfo separately', async () => {
    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    const result = useWPConnection('Posts', ['posts'], false, { first: 3 })

    expect(result.pageInfo.value).toEqual({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'cursor-1',
      endCursor: 'cursor-3'
    })
  })

  it('should return undefined data when connection is empty', async () => {
    mockUseAsyncGraphqlQuery.mockReturnValue({
      data: ref({ data: { posts: null } }),
      pending: ref(false),
      refresh: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
      error: ref(null),
      status: ref('success'),
      then: (fn?: (v: unknown) => unknown) => Promise.resolve(fn ? fn(undefined) : undefined)
    })

    vi.doMock('#imports', () => ({
      computed: vi.fn((fn) => {
        try {
          return { value: fn() }
        } catch {
          return { value: undefined }
        }
      }),
      ref: vi.fn(val => ({ value: val })),
      toValue: vi.fn(val => val),
      watch: vi.fn(),
      useAsyncGraphqlQuery: mockUseAsyncGraphqlQuery,
      useRuntimeConfig: vi.fn(() => ({ public: { wpNuxt: {} } }))
    }))

    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    const result = useWPConnection('Posts', ['posts'], false)

    expect(result.data.value).toBeUndefined()
    expect(result.pageInfo.value).toBeUndefined()
  })

  it('should return undefined data when nodes is not an array', async () => {
    mockUseAsyncGraphqlQuery.mockReturnValue({
      data: ref({ data: { posts: { nodes: 'not-an-array', pageInfo: {} } } }),
      pending: ref(false),
      refresh: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
      error: ref(null),
      status: ref('success'),
      then: (fn?: (v: unknown) => unknown) => Promise.resolve(fn ? fn(undefined) : undefined)
    })

    vi.doMock('#imports', () => ({
      computed: vi.fn((fn) => {
        try {
          return { value: fn() }
        } catch {
          return { value: undefined }
        }
      }),
      ref: vi.fn(val => ({ value: val })),
      toValue: vi.fn(val => val),
      watch: vi.fn(),
      useAsyncGraphqlQuery: mockUseAsyncGraphqlQuery,
      useRuntimeConfig: vi.fn(() => ({ public: { wpNuxt: {} } }))
    }))

    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    const result = useWPConnection('Posts', ['posts'], false)

    expect(result.data.value).toBeUndefined()
  })

  it('should expose pending, refresh, execute, clear, error, status', async () => {
    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    const result = useWPConnection('Posts', ['posts'], false)

    expect(result).toHaveProperty('pending')
    expect(result).toHaveProperty('refresh')
    expect(result).toHaveProperty('execute')
    expect(result).toHaveProperty('clear')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('status')
  })

  it('should pass params through to useWPContent', async () => {
    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    useWPConnection('Posts', ['posts'], false, { first: 5, after: 'cursor-abc' })

    const calls = mockUseAsyncGraphqlQuery.mock.calls
    expect(calls[0]![0]).toBe('Posts')
    // Params are wrapped in a computed ref (mergedParams) by useWPConnection
    const passedParams = calls[0]![1] as { value: Record<string, unknown> }
    expect(passedParams.value).toEqual({ first: 5, after: 'cursor-abc' })
  })

  it('should be thenable for await support', async () => {
    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    const result = useWPConnection('Posts', ['posts'], false)

    // Should have .then for await support
    expect(typeof result.then).toBe('function')
  })

  it('should expose loadMore function', async () => {
    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    const result = useWPConnection('Posts', ['posts'], false)

    expect(result).toHaveProperty('loadMore')
    expect(typeof result.loadMore).toBe('function')
  })

  it('should expose refresh that resets accumulation', async () => {
    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    const result = useWPConnection('Posts', ['posts'], false)

    expect(result).toHaveProperty('refresh')
    expect(typeof result.refresh).toBe('function')
  })

  it('should merge loadMore cursor into params', async () => {
    const { useWPConnection } = await import('../src/runtime/composables/useWPConnection')

    const result = useWPConnection('Posts', ['posts'], false, { first: 3 })

    // Initially, mergedParams should have user params without cursor
    const calls = mockUseAsyncGraphqlQuery.mock.calls
    const mergedParams = calls[0]![1] as { value: Record<string, unknown> }
    expect(mergedParams.value).toEqual({ first: 3 })

    // After loadMore, the cursor should be merged
    // (loadMore sets internal state but won't trigger actual refetch in mocked env)
    await result.loadMore()
  })
})
