import { describe, it, expect } from 'vitest'
import { findData, transformData, normalizeUriParam } from '../src/runtime/util/content'

describe('content utilities', () => {
  describe('findData', () => {
    it('should return data unchanged when nodes array is empty', () => {
      const data = { posts: { nodes: [{ id: 1 }] } }
      expect(findData(data, [])).toEqual(data)
    })

    it('should extract single-level nested data', () => {
      const data = { posts: [{ id: 1 }, { id: 2 }] }
      expect(findData(data, ['posts'])).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should extract multi-level nested data', () => {
      const data = { posts: { nodes: [{ id: 1 }, { id: 2 }] } }
      expect(findData(data, ['posts', 'nodes'])).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should extract deeply nested data', () => {
      const data = { level1: { level2: { level3: { value: 'deep' } } } }
      expect(findData(data, ['level1', 'level2', 'level3'])).toEqual({ value: 'deep' })
    })

    it('should return undefined for non-existent path', () => {
      const data = { posts: { nodes: [] } }
      expect(findData(data, ['posts', 'edges'])).toBeUndefined()
    })

    it('should return undefined when path traverses non-object', () => {
      const data = { posts: 'not an object' }
      expect(findData(data, ['posts', 'nodes'])).toBeUndefined()
    })

    it('should handle null data', () => {
      expect(findData(null, ['posts'])).toBeUndefined()
    })

    it('should handle undefined data', () => {
      expect(findData(undefined, ['posts'])).toBeUndefined()
    })

    it('should return primitive values at end of path', () => {
      const data = { settings: { title: 'My Site' } }
      expect(findData(data, ['settings', 'title'])).toBe('My Site')
    })

    it('should handle array access in path', () => {
      const data = { items: [{ name: 'first' }, { name: 'second' }] }
      expect(findData(data, ['items'])).toEqual([{ name: 'first' }, { name: 'second' }])
    })
  })

  describe('transformData', () => {
    it('should extract and return data without transformation when fixImagePaths is false', () => {
      const data = { post: { title: 'Test Post' } }
      expect(transformData(data, ['post'], false)).toEqual({ title: 'Test Post' })
    })

    it('should not modify data without featuredImage when fixImagePaths is true', () => {
      const data = { post: { title: 'Test Post' } }
      expect(transformData(data, ['post'], true)).toEqual({ title: 'Test Post' })
    })

    it('should add relativePath to featuredImage when fixImagePaths is true', () => {
      const data = {
        post: {
          title: 'Test Post',
          featuredImage: {
            node: {
              sourceUrl: 'https://example.com/wp-content/uploads/2024/image.jpg'
            }
          }
        }
      }
      const result = transformData<{ title: string, featuredImage: { node: { sourceUrl: string, relativePath?: string } } }>(data, ['post'], true)
      expect(result.featuredImage.node.relativePath).toBe('/wp-content/uploads/2024/image.jpg')
    })

    it('should preserve original sourceUrl when adding relativePath', () => {
      const data = {
        post: {
          featuredImage: {
            node: {
              sourceUrl: 'https://example.com/wp-content/uploads/image.jpg'
            }
          }
        }
      }
      const result = transformData<{ featuredImage: { node: { sourceUrl: string, relativePath?: string } } }>(data, ['post'], true)
      expect(result.featuredImage.node.sourceUrl).toBe('https://example.com/wp-content/uploads/image.jpg')
    })

    it('should handle missing featuredImage.node gracefully', () => {
      const data = {
        post: {
          title: 'Test',
          featuredImage: {}
        }
      }
      expect(transformData(data, ['post'], true)).toEqual({ title: 'Test', featuredImage: {} })
    })

    it('should handle null featuredImage gracefully', () => {
      const data = {
        post: {
          title: 'Test',
          featuredImage: null
        }
      }
      expect(transformData(data, ['post'], true)).toEqual({ title: 'Test', featuredImage: null })
    })

    it('should handle non-string sourceUrl gracefully', () => {
      const data = {
        post: {
          featuredImage: {
            node: {
              sourceUrl: 12345
            }
          }
        }
      }
      const result = transformData<{ featuredImage: { node: { sourceUrl: number, relativePath?: string } } }>(data, ['post'], true)
      expect(result.featuredImage.node.relativePath).toBeUndefined()
    })

    it('should return undefined when data path does not exist', () => {
      const data = { posts: [] }
      expect(transformData(data, ['nonexistent'], false)).toBeUndefined()
    })

    it('should add relativePath to each item in an array of posts', () => {
      const data = {
        posts: {
          nodes: [
            { title: 'Post 1', featuredImage: { node: { sourceUrl: 'https://example.com/wp-content/uploads/img1.jpg' } } },
            { title: 'Post 2', featuredImage: { node: { sourceUrl: 'https://example.com/wp-content/uploads/img2.jpg' } } }
          ]
        }
      }
      const result = transformData<{ title: string, featuredImage: { node: { sourceUrl: string, relativePath?: string } } }[]>(data, ['posts', 'nodes'], true)
      expect(result[0]!.featuredImage.node.relativePath).toBe('/wp-content/uploads/img1.jpg')
      expect(result[1]!.featuredImage.node.relativePath).toBe('/wp-content/uploads/img2.jpg')
    })

    it('should not modify array items without featuredImage', () => {
      const data = {
        posts: {
          nodes: [
            { title: 'Post 1' },
            { title: 'Post 2' }
          ]
        }
      }
      const result = transformData<{ title: string }[]>(data, ['posts', 'nodes'], true)
      expect(result).toEqual([{ title: 'Post 1' }, { title: 'Post 2' }])
    })

    it('should handle mixed array with some items having featuredImage', () => {
      interface PostWithImage { title: string, featuredImage?: { node: { sourceUrl: string, relativePath?: string } } }
      const data = {
        posts: {
          nodes: [
            { title: 'Post 1', featuredImage: { node: { sourceUrl: 'https://example.com/wp-content/uploads/img1.jpg' } } },
            { title: 'Post 2' },
            { title: 'Post 3', featuredImage: { node: { sourceUrl: 'https://example.com/wp-content/uploads/img3.jpg' } } }
          ]
        }
      }
      const result = transformData<PostWithImage[]>(data, ['posts', 'nodes'], true)
      expect(result[0]!.featuredImage?.node.relativePath).toBe('/wp-content/uploads/img1.jpg')
      expect(result[1]).toEqual({ title: 'Post 2' })
      expect(result[2]!.featuredImage?.node.relativePath).toBe('/wp-content/uploads/img3.jpg')
    })
  })

  describe('normalizeUriParam', () => {
    it('should add trailing slash to uri without one', () => {
      const params = { uri: '/hello-world' }
      expect(normalizeUriParam(params)).toEqual({ uri: '/hello-world/' })
    })

    it('should not modify uri that already has trailing slash', () => {
      const params = { uri: '/hello-world/' }
      expect(normalizeUriParam(params)).toEqual({ uri: '/hello-world/' })
    })

    it('should preserve other parameters', () => {
      const params = { uri: '/test', limit: 10, category: 'news' }
      expect(normalizeUriParam(params)).toEqual({ uri: '/test/', limit: 10, category: 'news' })
    })

    it('should return params unchanged if no uri property', () => {
      const params = { id: 123, slug: 'test' }
      expect(normalizeUriParam(params)).toEqual({ id: 123, slug: 'test' })
    })

    it('should return null unchanged', () => {
      expect(normalizeUriParam(null)).toBeNull()
    })

    it('should return undefined unchanged', () => {
      expect(normalizeUriParam(undefined)).toBeUndefined()
    })

    it('should return primitive values unchanged', () => {
      expect(normalizeUriParam('string')).toBe('string')
      expect(normalizeUriParam(123)).toBe(123)
      expect(normalizeUriParam(true)).toBe(true)
    })

    it('should handle empty uri string', () => {
      const params = { uri: '' }
      expect(normalizeUriParam(params)).toEqual({ uri: '/' })
    })

    it('should handle root uri', () => {
      const params = { uri: '/' }
      expect(normalizeUriParam(params)).toEqual({ uri: '/' })
    })

    it('should handle non-string uri gracefully', () => {
      const params = { uri: 123 }
      expect(normalizeUriParam(params)).toEqual({ uri: 123 })
    })

    it('should handle nested paths', () => {
      const params = { uri: '/blog/2024/my-post' }
      expect(normalizeUriParam(params)).toEqual({ uri: '/blog/2024/my-post/' })
    })

    it('should create new object (immutability)', () => {
      const params = { uri: '/test' }
      const result = normalizeUriParam(params)
      expect(result).not.toBe(params)
      expect(params.uri).toBe('/test') // Original unchanged
    })
  })
})
