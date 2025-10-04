import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWPContent } from '../../src/runtime/composables/useWPContent'

// Mock $fetch
global.$fetch = vi.fn()

describe('useWPContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should fetch content successfully', async () => {
    const mockData = { title: 'Test Post' }
    vi.mocked($fetch).mockResolvedValue({
      data: mockData,
      error: null
    })

    const result = await useWPContent('query', 'TestQuery', [], false, {})

    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
    expect($fetch).toHaveBeenCalledWith('/api/wpContent', {
      method: 'POST',
      body: {
        operation: 'query',
        queryName: 'TestQuery',
        params: {}
      }
    })
  })

  it('should handle fetch errors', async () => {
    const mockError = new Error('Network error')
    vi.mocked($fetch).mockRejectedValue(mockError)

    const result = await useWPContent('query', 'TestQuery', [], false, {})

    expect(result.data).toBeUndefined()
    expect(result.error).toBeDefined()
    expect(console.error).toHaveBeenCalled()
  })

  it('should handle GraphQL errors', async () => {
    const mockError = { message: 'GraphQL error' }
    vi.mocked($fetch).mockResolvedValue({
      data: null,
      error: mockError
    })

    const result = await useWPContent('query', 'TestQuery', [], false, {})

    expect(result.data).toBeUndefined()
    expect(result.error).toEqual(mockError)
    expect(console.error).toHaveBeenCalled()
  })

  it('should traverse nodes in response', async () => {
    const mockData = {
      posts: {
        nodes: [
          { id: '1', title: 'Post 1' },
          { id: '2', title: 'Post 2' }
        ]
      }
    }
    vi.mocked($fetch).mockResolvedValue({
      data: mockData,
      error: null
    })

    const result = await useWPContent('query', 'TestQuery', ['posts', 'nodes'], false, {})

    expect(result.data).toEqual(mockData.posts.nodes)
  })

  it('should handle missing nodes gracefully', async () => {
    const mockData = { posts: {} }
    vi.mocked($fetch).mockResolvedValue({
      data: mockData,
      error: null
    })

    const result = await useWPContent('query', 'TestQuery', ['posts', 'nodes'], false, {})

    // Should return posts object when nodes doesn't exist
    expect(result.data).toEqual(mockData.posts)
  })

  it('should pass params correctly', async () => {
    const params = { slug: 'test-post' }
    vi.mocked($fetch).mockResolvedValue({
      data: { title: 'Test' },
      error: null
    })

    await useWPContent('query', 'GetPostBySlug', [], false, params)

    expect($fetch).toHaveBeenCalledWith('/api/wpContent', {
      method: 'POST',
      body: {
        operation: 'query',
        queryName: 'GetPostBySlug',
        params
      }
    })
  })
})
