import { describe, it, expect } from 'vitest'
import { unwrapScalar, unwrapConnection } from '../src/runtime/util/acf'

describe('ACF helpers', () => {
  describe('unwrapScalar', () => {
    it('should return first element from array', () => {
      expect(unwrapScalar(['active'])).toBe('active')
    })

    it('should return first element from multi-element array', () => {
      expect(unwrapScalar(['first', 'second'])).toBe('first')
    })

    it('should pass through scalar string', () => {
      expect(unwrapScalar('active')).toBe('active')
    })

    it('should pass through scalar number', () => {
      expect(unwrapScalar(42)).toBe(42)
    })

    it('should return undefined for empty array', () => {
      expect(unwrapScalar([])).toBeUndefined()
    })

    it('should return undefined for null', () => {
      expect(unwrapScalar(null)).toBeUndefined()
    })

    it('should return undefined for undefined', () => {
      expect(unwrapScalar(undefined)).toBeUndefined()
    })
  })

  describe('unwrapConnection', () => {
    it('should return first node from connection', () => {
      const connection = { nodes: [{ title: 'Main Hall', slug: 'main-hall' }] }
      expect(unwrapConnection(connection)).toEqual({ title: 'Main Hall', slug: 'main-hall' })
    })

    it('should return first node from multi-node connection', () => {
      const connection = { nodes: [{ id: 1 }, { id: 2 }] }
      expect(unwrapConnection(connection)).toEqual({ id: 1 })
    })

    it('should return undefined for empty nodes', () => {
      expect(unwrapConnection({ nodes: [] })).toBeUndefined()
    })

    it('should return undefined for null', () => {
      expect(unwrapConnection(null)).toBeUndefined()
    })

    it('should return undefined for undefined', () => {
      expect(unwrapConnection(undefined)).toBeUndefined()
    })
  })
})
