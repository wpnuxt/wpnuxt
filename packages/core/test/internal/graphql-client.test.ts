import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUseAsyncGraphqlQuery = vi.fn()
const mockUseGraphqlMutation = vi.fn()

vi.mock('#imports', () => ({
  useAsyncGraphqlQuery: mockUseAsyncGraphqlQuery,
  useGraphqlMutation: mockUseGraphqlMutation
}))

describe('internal/graphql-client', () => {
  beforeEach(() => {
    vi.resetModules()
    mockUseAsyncGraphqlQuery.mockReset()
    mockUseGraphqlMutation.mockReset()
  })

  it('wpQuery forwards arguments to useAsyncGraphqlQuery and returns its result', async () => {
    const sentinelResult = { data: { value: { posts: { nodes: [] } } } }
    mockUseAsyncGraphqlQuery.mockReturnValue(sentinelResult)

    const { wpQuery } = await import('../../src/runtime/internal/graphql-client')
    const params = { uri: '/hello-world/' }
    const options = { lazy: true }
    const result = wpQuery('Posts' as never, params as never, options as never)

    expect(mockUseAsyncGraphqlQuery).toHaveBeenCalledTimes(1)
    expect(mockUseAsyncGraphqlQuery).toHaveBeenCalledWith('Posts', params, options)
    expect(result).toBe(sentinelResult)
  })

  it('wpMutation forwards arguments to useGraphqlMutation and returns its result', async () => {
    const sentinelResult = Promise.resolve({ data: { login: { authToken: 'x' } } })
    mockUseGraphqlMutation.mockReturnValue(sentinelResult)

    const { wpMutation } = await import('../../src/runtime/internal/graphql-client')
    const variables = { username: 'a', password: 'b' }
    const options = { fetchOptions: { headers: { 'X-Test': '1' } } }
    const result = wpMutation('Login' as never, variables as never, options as never)

    expect(mockUseGraphqlMutation).toHaveBeenCalledTimes(1)
    expect(mockUseGraphqlMutation).toHaveBeenCalledWith('Login', variables, options)
    expect(result).toBe(sentinelResult)
  })

  it('wpQuery preserves thenable behavior of the underlying result', async () => {
    const refs = { data: { value: { posts: { nodes: [{ id: 1 }] } } } }
    const thenable = Object.assign(Promise.resolve(refs), refs)
    mockUseAsyncGraphqlQuery.mockReturnValue(thenable)

    const { wpQuery } = await import('../../src/runtime/internal/graphql-client')
    const result = wpQuery('Posts' as never, {} as never, {} as never)

    expect(result).toBe(thenable)
    await expect(Promise.resolve(result)).resolves.toBe(refs)
  })
})
