import { describe, it, expect } from 'vitest'
import { isInternalLink, toRelativePath } from '../src/runtime/util/links'

describe('links', () => {
  const wordpressUrl = 'https://wordpress.example.com'

  describe('isInternalLink', () => {
    it('should return true for matching domains', () => {
      expect(isInternalLink('https://wordpress.example.com/hello-world/', wordpressUrl)).toBe(true)
    })

    it('should return true for matching domains with different paths', () => {
      expect(isInternalLink('https://wordpress.example.com/category/news/', wordpressUrl)).toBe(true)
    })

    it('should return true even with protocol mismatch (http vs https)', () => {
      expect(isInternalLink('http://wordpress.example.com/hello-world/', wordpressUrl)).toBe(true)
    })

    it('should return false for external URLs', () => {
      expect(isInternalLink('https://external.com/page/', wordpressUrl)).toBe(false)
    })

    it('should return false for subdomain mismatch', () => {
      expect(isInternalLink('https://other.example.com/page/', wordpressUrl)).toBe(false)
    })

    it('should return true for already-relative paths', () => {
      expect(isInternalLink('/hello-world/', wordpressUrl)).toBe(true)
    })

    it('should return true for root path', () => {
      expect(isInternalLink('/', wordpressUrl)).toBe(true)
    })

    it('should return true for protocol-relative URLs with matching domain', () => {
      expect(isInternalLink('//wordpress.example.com/page/', wordpressUrl)).toBe(true)
    })

    it('should return false for protocol-relative URLs with different domain', () => {
      expect(isInternalLink('//external.com/page/', wordpressUrl)).toBe(false)
    })

    it('should return false for mailto: links', () => {
      expect(isInternalLink('mailto:user@example.com', wordpressUrl)).toBe(false)
    })

    it('should return false for tel: links', () => {
      expect(isInternalLink('tel:+1234567890', wordpressUrl)).toBe(false)
    })

    it('should return false for javascript: links', () => {
      expect(isInternalLink('javascript:void(0)', wordpressUrl)).toBe(false)
    })

    it('should return false for empty input', () => {
      expect(isInternalLink('', wordpressUrl)).toBe(false)
    })

    it('should return false for null input', () => {
      expect(isInternalLink(null as unknown as string, wordpressUrl)).toBe(false)
    })

    it('should return false for undefined input', () => {
      expect(isInternalLink(undefined as unknown as string, wordpressUrl)).toBe(false)
    })

    it('should return false when wordpressUrl is empty', () => {
      expect(isInternalLink('https://wordpress.example.com/page/', '')).toBe(false)
    })

    it('should handle URLs with query parameters', () => {
      expect(isInternalLink('https://wordpress.example.com/page/?preview=true', wordpressUrl)).toBe(true)
    })

    it('should handle URLs with hash fragments', () => {
      expect(isInternalLink('https://wordpress.example.com/page/#section', wordpressUrl)).toBe(true)
    })

    it('should handle URLs with trailing slash variations', () => {
      expect(isInternalLink('https://wordpress.example.com/page', wordpressUrl)).toBe(true)
      expect(isInternalLink('https://wordpress.example.com/page/', wordpressUrl)).toBe(true)
    })
  })

  describe('toRelativePath', () => {
    it('should convert absolute URL to relative path', () => {
      expect(toRelativePath('https://wordpress.example.com/hello-world/')).toBe('/hello-world/')
    })

    it('should preserve query parameters', () => {
      expect(toRelativePath('https://wordpress.example.com/page/?preview=true&token=abc')).toBe('/page/?preview=true&token=abc')
    })

    it('should preserve hash fragments', () => {
      expect(toRelativePath('https://wordpress.example.com/page/#section')).toBe('/page/#section')
    })

    it('should preserve both query and hash', () => {
      expect(toRelativePath('https://wordpress.example.com/page/?key=val#section')).toBe('/page/?key=val#section')
    })

    it('should return already-relative paths unchanged', () => {
      expect(toRelativePath('/hello-world/')).toBe('/hello-world/')
    })

    it('should return root path unchanged', () => {
      expect(toRelativePath('/')).toBe('/')
    })

    it('should handle protocol-relative URLs', () => {
      expect(toRelativePath('//wordpress.example.com/page/')).toBe('/page/')
    })

    it('should return empty string for empty input', () => {
      expect(toRelativePath('')).toBe('')
    })

    it('should return empty string for null input', () => {
      expect(toRelativePath(null as unknown as string)).toBe('')
    })

    it('should return empty string for undefined input', () => {
      expect(toRelativePath(undefined as unknown as string)).toBe('')
    })

    it('should handle URLs with port numbers', () => {
      expect(toRelativePath('https://wordpress.example.com:8080/page/')).toBe('/page/')
    })

    it('should handle root URL', () => {
      expect(toRelativePath('https://wordpress.example.com')).toBe('/')
    })

    it('should handle root URL with trailing slash', () => {
      expect(toRelativePath('https://wordpress.example.com/')).toBe('/')
    })
  })
})
