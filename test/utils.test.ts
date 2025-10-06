import { describe, it, expect } from 'vitest'
import { randHashGenerator } from '../src/utils/index'

describe('utils', () => {
  describe('randHashGenerator', () => {
    it('should generate a hash of default length 12', () => {
      const hash = randHashGenerator()
      expect(hash).toHaveLength(12)
    })

    it('should generate a hash of specified length', () => {
      const hash = randHashGenerator(20)
      expect(hash).toHaveLength(20)
    })

    it('should generate uppercase characters', () => {
      const hash = randHashGenerator()
      expect(hash).toMatch(/^[A-Z0-9]+$/)
    })

    it('should generate different hashes on multiple calls', () => {
      const hash1 = randHashGenerator()
      const hash2 = randHashGenerator()
      expect(hash1).not.toBe(hash2)
    })

    it('should handle edge case of length 1', () => {
      const hash = randHashGenerator(1)
      expect(hash).toHaveLength(1)
    })

    it('should handle large lengths', () => {
      const hash = randHashGenerator(100)
      expect(hash).toHaveLength(100)
    })
  })
})
