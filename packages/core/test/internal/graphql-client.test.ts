import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, watch as vueWatch, nextTick } from 'vue'

const mockUseAsyncGraphqlQuery = vi.fn()
const mockUseGraphqlMutation = vi.fn()
const mockCallHook = vi.fn<(name: string, payload: unknown) => Promise<void>>(() => Promise.resolve())
const mockUseNuxtApp = vi.fn(() => ({ callHook: mockCallHook }))

vi.mock('#imports', () => ({
  useAsyncGraphqlQuery: mockUseAsyncGraphqlQuery,
  useGraphqlMutation: mockUseGraphqlMutation,
  useNuxtApp: mockUseNuxtApp,
  watch: vueWatch,
  toValue: (v: unknown) => (typeof v === 'function' ? (v as () => unknown)() : v)
}))

vi.stubGlobal('import', { meta: { dev: true } })

function makeAsyncResult(overrides: Record<string, unknown> = {}) {
  return {
    data: ref<unknown>(null),
    pending: ref(false),
    error: ref<Error | null>(null),
    status: ref<'idle' | 'pending' | 'success' | 'error'>('idle'),
    refresh: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
    ...overrides
  }
}

describe('internal/graphql-client', () => {
  beforeEach(() => {
    vi.resetModules()
    mockUseAsyncGraphqlQuery.mockReset()
    mockUseGraphqlMutation.mockReset()
    mockCallHook.mockReset()
    mockCallHook.mockImplementation(() => Promise.resolve())
  })

  describe('wpQuery', () => {
    it('forwards arguments to useAsyncGraphqlQuery and returns its result', async () => {
      const sentinel = makeAsyncResult()
      mockUseAsyncGraphqlQuery.mockReturnValue(sentinel)

      const { wpQuery } = await import('../../src/runtime/internal/graphql-client')
      const params = { uri: '/hello-world/' }
      const options = { lazy: true }
      const result = wpQuery('Posts' as never, params as never, options as never)

      expect(mockUseAsyncGraphqlQuery).toHaveBeenCalledTimes(1)
      expect(mockUseAsyncGraphqlQuery).toHaveBeenCalledWith('Posts', params, options)
      expect(result).toBe(sentinel)
    })

    it('fires wpnuxt:query hook on fetch completion with success status', async () => {
      const sentinel = makeAsyncResult()
      mockUseAsyncGraphqlQuery.mockReturnValue(sentinel)

      const { wpQuery } = await import('../../src/runtime/internal/graphql-client')
      wpQuery('Posts' as never, { first: 10 } as never, {} as never)

      // Simulate a fetch cycle
      sentinel.pending.value = true
      await nextTick()
      sentinel.pending.value = false
      await nextTick()

      expect(mockCallHook).toHaveBeenCalledTimes(1)
      expect(mockCallHook).toHaveBeenCalledWith('wpnuxt:query', expect.objectContaining({
        queryName: 'Posts',
        queryType: 'query',
        variables: { first: 10 },
        status: 'success',
        durationMs: expect.any(Number)
      }))
      const payload = mockCallHook.mock.calls[0]![1] as unknown as { durationMs: number, error?: Error }
      expect(payload.durationMs).toBeGreaterThanOrEqual(0)
      expect(payload.error).toBeUndefined()
    })

    it('fires wpnuxt:query hook with error status when the request fails', async () => {
      const sentinel = makeAsyncResult()
      mockUseAsyncGraphqlQuery.mockReturnValue(sentinel)

      const { wpQuery } = await import('../../src/runtime/internal/graphql-client')
      wpQuery('Posts' as never, {} as never, {} as never)

      const fetchErr = new Error('Network down')
      sentinel.pending.value = true
      await nextTick()
      sentinel.error.value = fetchErr
      sentinel.pending.value = false
      await nextTick()

      expect(mockCallHook).toHaveBeenCalledTimes(1)
      const [hookName, payload] = mockCallHook.mock.calls[0]! as unknown as [string, { status: string, error: Error }]
      expect(hookName).toBe('wpnuxt:query')
      expect(payload.status).toBe('error')
      expect(payload.error).toBe(fetchErr)
    })

    it('does not fire the hook on cache hits (pending never becomes true)', async () => {
      const sentinel = makeAsyncResult()
      mockUseAsyncGraphqlQuery.mockReturnValue(sentinel)

      const { wpQuery } = await import('../../src/runtime/internal/graphql-client')
      wpQuery('Posts' as never, {} as never, {} as never)

      // pending stays false throughout — simulates a cache hit
      await nextTick()
      sentinel.pending.value = false
      await nextTick()

      expect(mockCallHook).not.toHaveBeenCalled()
    })

    it('fires the hook once per refresh attempt', async () => {
      const sentinel = makeAsyncResult()
      mockUseAsyncGraphqlQuery.mockReturnValue(sentinel)

      const { wpQuery } = await import('../../src/runtime/internal/graphql-client')
      wpQuery('Posts' as never, {} as never, {} as never)

      // First fetch
      sentinel.pending.value = true
      await nextTick()
      sentinel.pending.value = false
      await nextTick()

      // Refresh
      sentinel.pending.value = true
      await nextTick()
      sentinel.pending.value = false
      await nextTick()

      expect(mockCallHook).toHaveBeenCalledTimes(2)
    })

    it('resolves reactive variables via toValue before emitting', async () => {
      const sentinel = makeAsyncResult()
      mockUseAsyncGraphqlQuery.mockReturnValue(sentinel)

      const { wpQuery } = await import('../../src/runtime/internal/graphql-client')
      const variablesGetter = () => ({ uri: '/hello-world/' })
      wpQuery('PostByUri' as never, variablesGetter as never, {} as never)

      sentinel.pending.value = true
      await nextTick()
      sentinel.pending.value = false
      await nextTick()

      const payload = mockCallHook.mock.calls[0]![1] as unknown as { variables: Record<string, unknown> }
      expect(payload.variables).toEqual({ uri: '/hello-world/' })
    })
  })

  describe('wpMutation', () => {
    it('forwards arguments to useGraphqlMutation and returns its result', async () => {
      const sentinelPromise = Promise.resolve({ data: { login: { authToken: 'x' } } })
      mockUseGraphqlMutation.mockReturnValue(sentinelPromise)

      const { wpMutation } = await import('../../src/runtime/internal/graphql-client')
      const variables = { username: 'a', password: 'b' }
      const options = { fetchOptions: { headers: { 'X-Test': '1' } } }
      const result = wpMutation('Login' as never, variables as never, options as never)

      expect(mockUseGraphqlMutation).toHaveBeenCalledTimes(1)
      expect(mockUseGraphqlMutation).toHaveBeenCalledWith('Login', variables, options)
      expect(result).toBe(sentinelPromise)
    })

    it('fires wpnuxt:query hook with success status when mutation resolves', async () => {
      const sentinelPromise = Promise.resolve({ data: { login: { authToken: 'x' } } })
      mockUseGraphqlMutation.mockReturnValue(sentinelPromise)

      const { wpMutation } = await import('../../src/runtime/internal/graphql-client')
      wpMutation('Login' as never, { username: 'a' } as never, {} as never)

      await sentinelPromise
      await nextTick()

      expect(mockCallHook).toHaveBeenCalledTimes(1)
      expect(mockCallHook).toHaveBeenCalledWith('wpnuxt:query', expect.objectContaining({
        queryName: 'Login',
        queryType: 'mutation',
        variables: { username: 'a' },
        status: 'success',
        durationMs: expect.any(Number)
      }))
    })

    it('fires wpnuxt:query hook with error status when mutation rejects', async () => {
      const mutationErr = new Error('Forbidden')
      const rejectedPromise = Promise.reject(mutationErr)
      // Prevent unhandled-rejection noise in the runner; wpMutation attaches its own handler.
      rejectedPromise.catch(() => {})
      mockUseGraphqlMutation.mockReturnValue(rejectedPromise)

      const { wpMutation } = await import('../../src/runtime/internal/graphql-client')
      const result = wpMutation('Login' as never, {} as never, {} as never)
      await expect(result).rejects.toBe(mutationErr)
      await nextTick()

      expect(mockCallHook).toHaveBeenCalledTimes(1)
      const [, payload] = mockCallHook.mock.calls[0]! as unknown as [string, { status: string, error: Error }]
      expect(payload.status).toBe('error')
      expect(payload.error).toBe(mutationErr)
    })
  })

  describe('hook handler isolation', () => {
    it('does not throw when the user hook handler rejects', async () => {
      mockCallHook.mockImplementation(() => Promise.reject(new Error('handler exploded')))
      const sentinel = makeAsyncResult()
      mockUseAsyncGraphqlQuery.mockReturnValue(sentinel)

      const { wpQuery } = await import('../../src/runtime/internal/graphql-client')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => wpQuery('Posts' as never, {} as never, {} as never)).not.toThrow()
      sentinel.pending.value = true
      await nextTick()
      sentinel.pending.value = false
      await nextTick()
      // Flush the catch
      await Promise.resolve()

      expect(mockCallHook).toHaveBeenCalledTimes(1)
      warnSpy.mockRestore()
    })
  })
})
