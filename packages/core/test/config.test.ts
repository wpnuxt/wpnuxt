import { describe, it, expect } from 'vitest'

// Test the config validation logic directly
// The actual loadConfig function is private, so we test its behavior indirectly

describe('module configuration', () => {
  describe('wordpressUrl validation', () => {
    // Helper to simulate the validation logic from module.ts
    function validateConfig(config: { wordpressUrl?: string }) {
      if (!config.wordpressUrl?.trim()) {
        throw new Error('WPNuxt error: WordPress url is missing')
      }
      if (config.wordpressUrl.endsWith('/')) {
        throw new Error(`WPNuxt error: WordPress url should not have a trailing slash: ${config.wordpressUrl}`)
      }
      return config
    }

    it('should throw error when wordpressUrl is missing', () => {
      expect(() => validateConfig({ wordpressUrl: '' }))
        .toThrow('WordPress url is missing')
    })

    it('should throw error when wordpressUrl is undefined', () => {
      expect(() => validateConfig({ wordpressUrl: undefined }))
        .toThrow('WordPress url is missing')
    })

    it('should throw error when wordpressUrl is whitespace only', () => {
      expect(() => validateConfig({ wordpressUrl: '   ' }))
        .toThrow('WordPress url is missing')
    })

    it('should throw error when wordpressUrl has trailing slash', () => {
      expect(() => validateConfig({ wordpressUrl: 'https://example.com/' }))
        .toThrow('trailing slash')
    })

    it('should accept valid wordpressUrl without trailing slash', () => {
      expect(() => validateConfig({ wordpressUrl: 'https://example.com' }))
        .not.toThrow()
    })

    it('should accept valid wordpressUrl with path', () => {
      expect(() => validateConfig({ wordpressUrl: 'https://example.com/wordpress' }))
        .not.toThrow()
    })
  })
})
