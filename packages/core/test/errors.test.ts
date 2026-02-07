import { describe, it, expect } from 'vitest'
import {
  createWPNuxtError,
  isWPNuxtError,
  success,
  failure,
  fromError
} from '../src/runtime/types/errors'

describe('WPNuxt Error Types', () => {
  describe('createWPNuxtError', () => {
    it('creates an error with required fields', () => {
      const error = createWPNuxtError('NETWORK_ERROR', 'Connection failed')

      expect(error.code).toBe('NETWORK_ERROR')
      expect(error.message).toBe('Connection failed')
      expect(error.timestamp).toBeTypeOf('number')
      expect(error.timestamp).toBeLessThanOrEqual(Date.now())
    })

    it('includes optional details and query', () => {
      const error = createWPNuxtError('GRAPHQL_ERROR', 'Query failed', {
        details: { errors: ['Field not found'] },
        query: 'GetPosts'
      })

      expect(error.details).toEqual({ errors: ['Field not found'] })
      expect(error.query).toBe('GetPosts')
    })
  })

  describe('isWPNuxtError', () => {
    it('returns true for valid WPNuxt errors', () => {
      const error = createWPNuxtError('TIMEOUT_ERROR', 'Request timed out')
      expect(isWPNuxtError(error)).toBe(true)
    })

    it('returns false for standard Error objects', () => {
      const error = new Error('Standard error')
      expect(isWPNuxtError(error)).toBe(false)
    })

    it('returns false for null/undefined', () => {
      expect(isWPNuxtError(null)).toBe(false)
      expect(isWPNuxtError(undefined)).toBe(false)
    })

    it('returns false for partial objects', () => {
      expect(isWPNuxtError({ code: 'ERROR' })).toBe(false)
      expect(isWPNuxtError({ message: 'Error' })).toBe(false)
      expect(isWPNuxtError({ code: 'ERROR', message: 'Error' })).toBe(false)
    })
  })

  describe('success/failure helpers', () => {
    it('creates a successful result', () => {
      const result = success({ id: 1, title: 'Post' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 1, title: 'Post' })
      expect(result.error).toBeNull()
    })

    it('creates a failed result', () => {
      const error = createWPNuxtError('AUTH_ERROR', 'Unauthorized')
      const result = failure(error)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBe(error)
    })
  })

  describe('fromError', () => {
    it('converts standard Error to WPNuxtError', () => {
      const standardError = new Error('Something went wrong')
      const wpError = fromError(standardError)

      expect(wpError.code).toBe('NETWORK_ERROR')
      expect(wpError.message).toBe('Something went wrong')
      expect(wpError.details).toBe(standardError.stack)
    })

    it('detects AbortError as TIMEOUT_ERROR', () => {
      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      const wpError = fromError(abortError)

      expect(wpError.code).toBe('TIMEOUT_ERROR')
    })

    it('detects GraphQL errors', () => {
      const gqlError = new Error('GraphQL validation failed')
      const wpError = fromError(gqlError)

      expect(wpError.code).toBe('GRAPHQL_ERROR')
    })

    it('detects auth errors from status codes', () => {
      const authError = new Error('HTTP 401 Unauthorized')
      const wpError = fromError(authError)

      expect(wpError.code).toBe('AUTH_ERROR')
    })

    it('includes query name when provided', () => {
      const error = new Error('Failed')
      const wpError = fromError(error, 'NETWORK_ERROR', 'GetPosts')

      expect(wpError.query).toBe('GetPosts')
    })
  })
})
