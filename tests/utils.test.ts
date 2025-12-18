import { describe, it, expect } from 'vitest'
import { validateConfig } from '../src/utils'

describe('utils', () => {
  describe('validateConfig', () => {
    it('should throw error when wordpressUrl is missing', () => {
      expect(() => {
        validateConfig({ wordpressUrl: '' })
      }).toThrow('WordPress url is missing')
    })

    it('should throw error when wordpressUrl has trailing slash', () => {
      expect(() => {
        validateConfig({ wordpressUrl: 'https://example.com/' })
      }).toThrow('WordPress url should not have a trailing slash')
    })

    it('should throw error when frontendUrl has trailing slash', () => {
      expect(() => {
        validateConfig({
          wordpressUrl: 'https://wordpress.example.com',
          frontendUrl: 'https://example.com/'
        })
      }).toThrow('frontend url should not have a trailing slash')
    })

    it('should pass validation with valid config', () => {
      expect(() => {
        validateConfig({
          wordpressUrl: 'https://wordpress.example.com',
          frontendUrl: 'https://example.com'
        })
      }).not.toThrow()
    })

    it('should pass validation without frontendUrl', () => {
      expect(() => {
        validateConfig({
          wordpressUrl: 'https://wordpress.example.com'
        })
      }).not.toThrow()
    })
  })
})
