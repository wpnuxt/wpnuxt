import { describe, it, expect } from 'vitest'
import { convertFontSize, getColor, getCssClasses } from '../src/runtime/util'
import type { EditorBlock } from '../src/runtime/types'

describe('block utilities', () => {
  describe('convertFontSize', () => {
    it('converts "small" to "sm"', () => {
      expect(convertFontSize('small')).toBe('sm')
    })

    it('converts "medium" to "md"', () => {
      expect(convertFontSize('medium')).toBe('md')
    })

    it('converts "large" to "lg"', () => {
      expect(convertFontSize('large')).toBe('lg')
    })

    it('converts "x-large" to "xl"', () => {
      expect(convertFontSize('x-large')).toBe('xl')
    })

    it('converts "xx-large" to "2xl"', () => {
      expect(convertFontSize('xx-large')).toBe('2xl')
    })

    it('adds prefix to converted size', () => {
      expect(convertFontSize('small', 'text-')).toBe('text-sm')
      expect(convertFontSize('large', 'text-')).toBe('text-lg')
    })

    it('returns empty string for undefined', () => {
      expect(convertFontSize(undefined)).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(convertFontSize('')).toBe('')
    })

    it('returns empty string for "null" string', () => {
      expect(convertFontSize('null')).toBe('')
    })

    it('returns defaultSize when fontSize is undefined', () => {
      expect(convertFontSize(undefined, 'text-', 'base')).toBe('text-base')
    })

    it('returns empty string for unknown font size', () => {
      expect(convertFontSize('unknown-size')).toBe('')
    })
  })

  describe('getColor', () => {
    it('converts "accent-3" to "text-primary-500"', () => {
      expect(getColor('accent-3')).toBe('text-primary-500')
    })

    it('returns empty string for undefined', () => {
      expect(getColor(undefined)).toBe('')
    })

    it('returns empty string for unknown color', () => {
      expect(getColor('unknown-color')).toBe('')
    })
  })

  describe('getCssClasses', () => {
    it('combines className, fontSize, and color', () => {
      const block: EditorBlock = {
        name: 'core/paragraph',
        attributes: {
          className: 'custom-class',
          fontSize: 'large',
          textColor: 'accent-3'
        }
      }
      const result = getCssClasses(block)
      expect(result).toContain('custom-class')
      expect(result).toContain('text-lg')
      expect(result).toContain('text-primary-500')
    })

    it('handles block with only className', () => {
      const block: EditorBlock = {
        name: 'core/paragraph',
        attributes: {
          className: 'my-class'
        }
      }
      const result = getCssClasses(block)
      expect(result).toContain('my-class')
    })

    it('handles block with no attributes', () => {
      const block: EditorBlock = {
        name: 'core/paragraph',
        attributes: null
      }
      const result = getCssClasses(block)
      expect(typeof result).toBe('string')
    })

    it('handles block with undefined attributes', () => {
      const block: EditorBlock = {
        name: 'core/paragraph'
      }
      const result = getCssClasses(block)
      expect(typeof result).toBe('string')
    })
  })
})
