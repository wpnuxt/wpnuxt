import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

describe('useNodeByRoute', () => {
  let mockUseAsyncGraphqlQuery: ReturnType<typeof vi.fn>
  let route: { path: string, query: Record<string, unknown> }
  let queryData: unknown

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    route = { path: '/hello', query: {} }
    queryData = { data: { nodeByUri: { title: 'Hello' }, contentNode: { title: 'Draft' } } }

    mockUseAsyncGraphqlQuery = vi.fn(() => {
      const result = {
        data: ref(queryData),
        pending: ref(false),
        refresh: vi.fn().mockResolvedValue(undefined),
        execute: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn(),
        error: ref(null),
        status: ref('success'),
        then: (fn: (v: unknown) => unknown) => Promise.resolve().then(() => fn(result))
      }
      return result
    })

    vi.doMock('#imports', () => ({
      computed: vi.fn(fn => ({ get value() { return fn() }, __v_isRef: true })),
      ref: vi.fn(val => ({ value: val })),
      toValue: vi.fn(val => typeof val === 'function' ? val() : (val && typeof val === 'object' && '__v_isRef' in val ? val.value : val)),
      watch: vi.fn(),
      createError: vi.fn(input => Object.assign(new Error(input.statusMessage), input)),
      showError: vi.fn(),
      useRoute: vi.fn(() => route),
      useAsyncGraphqlQuery: mockUseAsyncGraphqlQuery,
      useGraphqlMutation: vi.fn(),
      useNuxtApp: vi.fn(() => ({ callHook: vi.fn() })),
      useRuntimeConfig: vi.fn(() => ({ public: { wpNuxt: {} } }))
    }))
  })

  const lastCall = () => mockUseAsyncGraphqlQuery.mock.calls[0] as [string, { value: Record<string, unknown> } | Record<string, unknown>, Record<string, unknown>]

  it('fetches by URI for a normal request', async () => {
    const { useNodeByRoute } = await import('../src/runtime/composables/useNodeByRoute')
    const result = await useNodeByRoute()

    const [name, params] = lastCall()
    expect(name).toBe('NodeByUri')
    expect((params as { value: Record<string, unknown> }).value).toEqual({ uri: '/hello/' })
    expect(result.isPreview.value).toBe(false)
    expect(result.data.value).toEqual({ title: 'Hello' })
  })

  it('fetches by database ID for a draft preview link, without the client cache', async () => {
    route = { path: '/future-slug/', query: { preview: 'true', page_id: '1376' } }

    const { useNodeByRoute } = await import('../src/runtime/composables/useNodeByRoute')
    const result = await useNodeByRoute()

    const [name, params, options] = lastCall()
    expect(name).toBe('ContentNodeById')
    expect(params).toEqual({ id: '1376' })
    expect(options.graphqlCaching).toEqual({ client: false })
    expect(result.isPreview.value).toBe(true)
    expect(result.data.value).toEqual({ title: 'Draft' })
  })

  it('ignores ?p= without preview=true', async () => {
    route = { path: '/hello', query: { p: '123' } }

    const { useNodeByRoute } = await import('../src/runtime/composables/useNodeByRoute')
    const result = useNodeByRoute()

    expect(lastCall()[0]).toBe('NodeByUri')
    expect(result.isPreview.value).toBe(false)
  })

  it('throws a 404 for a normal request without content when throwOnNotFound is set', async () => {
    queryData = { data: { nodeByUri: null } }

    const { useNodeByRoute } = await import('../src/runtime/composables/useNodeByRoute')

    await expect(useNodeByRoute({ throwOnNotFound: true })).rejects.toMatchObject({ statusCode: 404 })
  })

  it('does not throw a 404 for a preview without content', async () => {
    route = { path: '/future-slug/', query: { preview: 'true', p: '42' } }
    queryData = { data: { contentNode: null } }

    const { useNodeByRoute } = await import('../src/runtime/composables/useNodeByRoute')
    const result = await useNodeByRoute({ throwOnNotFound: true })

    expect(result.isPreview.value).toBe(true)
    expect(result.data.value).toBeFalsy()
  })
})
