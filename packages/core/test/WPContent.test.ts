import { describe, it, expect } from 'vitest'
import { isInternalLink, toRelativePath } from '../src/runtime/util/links'

/**
 * Tests for the link interception logic used by WPContent.vue.
 *
 * The component itself depends on Vue/Nuxt runtime (#imports, navigateTo, etc.)
 * which makes direct component testing complex. Instead, we test the underlying
 * logic that WPContent.onClick relies on: isInternalLink and toRelativePath
 * combined in the same way the component uses them.
 */
describe('WPContent link interception logic', () => {
  const wordpressUrl = 'https://wordpress.example.com'

  describe('internal link detection for click handler', () => {
    it('should detect WordPress links as internal', () => {
      expect(isInternalLink('https://wordpress.example.com/hello-world/', wordpressUrl)).toBe(true)
    })

    it('should reject external links', () => {
      expect(isInternalLink('https://google.com', wordpressUrl)).toBe(false)
    })

    it('should treat relative paths as internal', () => {
      expect(isInternalLink('/hello-world/', wordpressUrl)).toBe(true)
    })

    it('should reject mailto links', () => {
      expect(isInternalLink('mailto:test@example.com', wordpressUrl)).toBe(false)
    })

    it('should reject tel links', () => {
      expect(isInternalLink('tel:+1234567890', wordpressUrl)).toBe(false)
    })

    it('should reject javascript links', () => {
      expect(isInternalLink('javascript:void(0)', wordpressUrl)).toBe(false)
    })

    it('should reject ftp links', () => {
      expect(isInternalLink('ftp://files.example.com', wordpressUrl)).toBe(false)
    })
  })

  describe('URL to relative path conversion for navigateTo', () => {
    it('should convert WordPress URL to relative path', () => {
      expect(toRelativePath('https://wordpress.example.com/hello-world/')).toBe('/hello-world/')
    })

    it('should preserve query params', () => {
      expect(toRelativePath('https://wordpress.example.com/page/?preview=true')).toBe('/page/?preview=true')
    })

    it('should preserve hash', () => {
      expect(toRelativePath('https://wordpress.example.com/page/#section')).toBe('/page/#section')
    })

    it('should pass through already-relative paths', () => {
      expect(toRelativePath('/hello-world/')).toBe('/hello-world/')
    })
  })

  describe('combined interception flow (as used by WPContent)', () => {
    it('should intercept and convert internal WordPress link', () => {
      const href = 'https://wordpress.example.com/about-us/'
      if (isInternalLink(href, wordpressUrl)) {
        const relativePath = toRelativePath(href)
        expect(relativePath).toBe('/about-us/')
      } else {
        expect.unreachable('Should have been detected as internal')
      }
    })

    it('should not intercept external links', () => {
      const href = 'https://external-site.com/page/'
      expect(isInternalLink(href, wordpressUrl)).toBe(false)
    })

    it('should not intercept non-http protocols', () => {
      const protocols = ['mailto:test@example.com', 'tel:123', 'javascript:void(0)', 'ftp://files.example.com']
      for (const href of protocols) {
        expect(isInternalLink(href, wordpressUrl)).toBe(false)
      }
    })
  })
})
