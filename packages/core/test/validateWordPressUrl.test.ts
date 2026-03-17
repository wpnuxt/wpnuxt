import { describe, it, expect } from 'vitest'
import { validateWordPressUrl } from '../src/utils/index'

describe('validateWordPressUrl', () => {
  it('should accept a valid https URL', () => {
    const result = validateWordPressUrl('https://wordpress.example.com')
    expect(result.valid).toBe(true)
    expect(result.normalizedUrl).toBe('https://wordpress.example.com')
  })

  it('should accept a valid http URL', () => {
    const result = validateWordPressUrl('http://wordpress.example.com')
    expect(result.valid).toBe(true)
    expect(result.normalizedUrl).toBe('http://wordpress.example.com')
  })

  it('should add https:// when no protocol is specified', () => {
    const result = validateWordPressUrl('wordpress.example.com')
    expect(result.valid).toBe(true)
    expect(result.normalizedUrl).toBe('https://wordpress.example.com')
  })

  it('should remove trailing slashes', () => {
    const result = validateWordPressUrl('https://wordpress.example.com/')
    expect(result.valid).toBe(true)
    expect(result.normalizedUrl).toBe('https://wordpress.example.com')
  })

  it('should remove multiple trailing slashes', () => {
    const result = validateWordPressUrl('https://wordpress.example.com///')
    expect(result.valid).toBe(true)
    expect(result.normalizedUrl).toBe('https://wordpress.example.com')
  })

  it('should trim whitespace', () => {
    const result = validateWordPressUrl('  https://wordpress.example.com  ')
    expect(result.valid).toBe(true)
    expect(result.normalizedUrl).toBe('https://wordpress.example.com')
  })

  it('should preserve paths', () => {
    const result = validateWordPressUrl('https://example.com/wordpress')
    expect(result.valid).toBe(true)
    expect(result.normalizedUrl).toBe('https://example.com/wordpress')
  })

  it('should reject empty string', () => {
    const result = validateWordPressUrl('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('URL cannot be empty')
  })

  it('should reject whitespace-only string', () => {
    const result = validateWordPressUrl('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('URL cannot be empty')
  })

  it('should reject invalid URL format', () => {
    const result = validateWordPressUrl('https://not a valid url')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid URL format')
  })
})
