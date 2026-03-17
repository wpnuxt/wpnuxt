import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

vi.mock('#imports', () => ({
  computed: vi.fn(fn => ({ value: fn() })),
  ref: vi.fn(val => ({ value: val })),
  toValue: vi.fn(val => val),
  watch: vi.fn(),
  useAsyncGraphqlQuery: vi.fn(),
  useRuntimeConfig: vi.fn(() => ({ public: { wpNuxt: {} } }))
}))

vi.stubGlobal('import', {
  meta: { dev: true, client: true }
})

const posts = [
  { slug: 'newest', uri: '/newest/', title: 'Newest Post' },
  { slug: 'middle', uri: '/middle/', title: 'Middle Post' },
  { slug: 'oldest', uri: '/oldest/', title: 'Oldest Post' }
]

describe('usePrevNextPost', () => {
  let mockUseAsyncGraphqlQuery: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    mockUseAsyncGraphqlQuery = vi.fn(() => {
      const result = {
        data: ref({ data: { posts: { nodes: posts } } }),
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

  it('should return prev and next for a middle post', async () => {
    const { usePrevNextPost } = await import('../src/runtime/composables/usePrevNextPost')
    const result = await usePrevNextPost('middle')

    expect(result.prev).toEqual({ slug: 'oldest', uri: '/oldest/', title: 'Oldest Post' })
    expect(result.next).toEqual({ slug: 'newest', uri: '/newest/', title: 'Newest Post' })
  })

  it('should return null prev for the oldest post', async () => {
    const { usePrevNextPost } = await import('../src/runtime/composables/usePrevNextPost')
    const result = await usePrevNextPost('oldest')

    expect(result.prev).toBeNull()
    expect(result.next).toEqual({ slug: 'middle', uri: '/middle/', title: 'Middle Post' })
  })

  it('should return null next for the newest post', async () => {
    const { usePrevNextPost } = await import('../src/runtime/composables/usePrevNextPost')
    const result = await usePrevNextPost('newest')

    expect(result.prev).toEqual({ slug: 'middle', uri: '/middle/', title: 'Middle Post' })
    expect(result.next).toBeNull()
  })

  it('should return null for both when slug is not found', async () => {
    const { usePrevNextPost } = await import('../src/runtime/composables/usePrevNextPost')
    const result = await usePrevNextPost('nonexistent')

    expect(result.prev).toBeNull()
    expect(result.next).toBeNull()
  })

  it('should strip leading and trailing slashes from slug', async () => {
    const { usePrevNextPost } = await import('../src/runtime/composables/usePrevNextPost')
    const result = await usePrevNextPost('/middle/')

    expect(result.prev).toEqual({ slug: 'oldest', uri: '/oldest/', title: 'Oldest Post' })
    expect(result.next).toEqual({ slug: 'newest', uri: '/newest/', title: 'Newest Post' })
  })

  it('should return null for both when posts array is empty', async () => {
    mockUseAsyncGraphqlQuery.mockReturnValue({
      data: ref({ data: { posts: { nodes: [] } } }),
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

    const { usePrevNextPost } = await import('../src/runtime/composables/usePrevNextPost')
    const result = await usePrevNextPost('anything')

    expect(result.prev).toBeNull()
    expect(result.next).toBeNull()
  })
})
