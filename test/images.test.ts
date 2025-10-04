import { describe, it, expect, vi } from 'vitest'
import { getRelativeImagePath } from '../src/runtime/util/images'

describe('images', () => {
  describe('getRelativeImagePath', () => {
    it('should convert full URL to relative path', () => {
      const url = 'https://example.com/wp-content/uploads/2024/01/image.jpg'
      const result = getRelativeImagePath(url)
      expect(result).toBe('/wp-content/uploads/2024/01/image.jpg')
    })

    it('should handle URLs with different protocols', () => {
      const url = 'http://example.com/path/to/image.png'
      const result = getRelativeImagePath(url)
      expect(result).toBe('/path/to/image.png')
    })

    it('should return empty string for empty input', () => {
      expect(getRelativeImagePath('')).toBe('')
    })

    it('should return empty string for null input', () => {
      expect(getRelativeImagePath(null as any)).toBe('')
    })

    it('should return empty string for undefined input', () => {
      expect(getRelativeImagePath(undefined as any)).toBe('')
    })

    it('should handle already relative paths starting with /', () => {
      const path = '/wp-content/uploads/image.jpg'
      const result = getRelativeImagePath(path)
      expect(result).toBe('/wp-content/uploads/image.jpg')
    })

    it('should warn and return empty string for invalid URLs', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const invalidUrl = 'not-a-valid-url'
      const result = getRelativeImagePath(invalidUrl)

      expect(result).toBe('')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid image URL provided')
      )

      consoleWarnSpy.mockRestore()
    })

    it('should handle URLs with query parameters', () => {
      const url = 'https://example.com/image.jpg?width=800&height=600'
      const result = getRelativeImagePath(url)
      expect(result).toBe('/image.jpg')
    })

    it('should handle URLs with hash fragments', () => {
      const url = 'https://example.com/image.jpg#section'
      const result = getRelativeImagePath(url)
      expect(result).toBe('/image.jpg')
    })
  })
})
