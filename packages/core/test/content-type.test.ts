import { describe, it, expect } from 'vitest'
import { isPage, isPost, isContentType } from '../src/runtime/util/content-type'

describe('content type guards', () => {
  const page = { contentTypeName: 'page', isFrontPage: true, title: 'About' }
  const post = { contentTypeName: 'post', categories: { nodes: [] }, title: 'Hello' }

  describe('isPage', () => {
    it('should return true for pages', () => {
      expect(isPage(page)).toBe(true)
    })

    it('should return false for posts', () => {
      expect(isPage(post)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isPage(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isPage(undefined)).toBe(false)
    })
  })

  describe('isPost', () => {
    it('should return true for posts', () => {
      expect(isPost(post)).toBe(true)
    })

    it('should return false for pages', () => {
      expect(isPost(page)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isPost(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isPost(undefined)).toBe(false)
    })
  })

  describe('isContentType', () => {
    it('should match custom post types', () => {
      const event = { contentTypeName: 'event', title: 'Concert' }
      expect(isContentType(event, 'event')).toBe(true)
    })

    it('should return false for non-matching types', () => {
      expect(isContentType(page, 'post')).toBe(false)
    })

    it('should work for built-in types too', () => {
      expect(isContentType(page, 'page')).toBe(true)
      expect(isContentType(post, 'post')).toBe(true)
    })

    it('should return false for null', () => {
      expect(isContentType(null, 'page')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isContentType(undefined, 'event')).toBe(false)
    })
  })
})
