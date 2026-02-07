import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { detectAuthCapabilities, validateAuthSchema } from '../src/utils/schemaDetection'
import * as fs from 'node:fs'

// Mock fs module
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}))

describe('schemaDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('detectAuthCapabilities', () => {
    it('returns null if schema file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).toBeNull()
    })

    it('returns null if schema file is unreadable', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File read error')
      })

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).toBeNull()
    })

    it('returns null if schema content is too short', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue('short')

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).toBeNull()
    })

    it('detects loginClients query (Headless Login plugin)', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Query {
          loginClients: [LoginClient]
          posts: [Post]
        }
        ${' '.repeat(100)}
      `)

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).not.toBeNull()
      expect(result?.hasHeadlessLogin).toBe(true)
    })

    it('detects login mutation with LoginInput', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Mutation {
          login(input: LoginInput!): LoginPayload
        }
        input LoginInput {
          username: String!
          password: String!
        }
        ${' '.repeat(100)}
      `)

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).not.toBeNull()
      expect(result?.hasPasswordAuth).toBe(true)
    })

    it('returns false for password auth if login exists but LoginInput is missing', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Mutation {
          login(username: String!): LoginPayload
        }
        ${' '.repeat(100)}
      `)

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).not.toBeNull()
      expect(result?.hasPasswordAuth).toBe(false)
    })

    it('detects refreshToken mutation', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Mutation {
          refreshToken(input: RefreshTokenInput): RefreshTokenPayload
        }
        ${' '.repeat(100)}
      `)

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).not.toBeNull()
      expect(result?.hasRefreshToken).toBe(true)
    })

    it('extracts providers from LoginProviderEnum', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        enum LoginProviderEnum {
          PASSWORD
          GOOGLE
          GITHUB
          FACEBOOK
        }
        ${' '.repeat(100)}
      `)

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).not.toBeNull()
      expect(result?.detectedProviders).toContain('PASSWORD')
      expect(result?.detectedProviders).toContain('GOOGLE')
      expect(result?.detectedProviders).toContain('GITHUB')
      expect(result?.detectedProviders).toContain('FACEBOOK')
    })

    it('returns empty providers array if no LoginProviderEnum', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Query {
          posts: [Post]
        }
        ${' '.repeat(100)}
      `)

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).not.toBeNull()
      expect(result?.detectedProviders).toEqual([])
    })

    it('detects full auth schema with all capabilities', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Query {
          loginClients: [LoginClient]
        }
        type Mutation {
          login(input: LoginInput!): LoginPayload
          refreshToken(input: RefreshTokenInput): RefreshTokenPayload
        }
        input LoginInput {
          username: String!
          password: String!
        }
        enum LoginProviderEnum {
          PASSWORD
          GOOGLE
        }
        ${' '.repeat(100)}
      `)

      const result = detectAuthCapabilities('/path/to/schema.graphql')

      expect(result).not.toBeNull()
      expect(result?.hasHeadlessLogin).toBe(true)
      expect(result?.hasPasswordAuth).toBe(true)
      expect(result?.hasRefreshToken).toBe(true)
      expect(result?.detectedProviders).toContain('PASSWORD')
      expect(result?.detectedProviders).toContain('GOOGLE')
    })
  })

  describe('validateAuthSchema', () => {
    it('throws error if schema file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      expect(() => validateAuthSchema('/path/to/schema.graphql'))
        .toThrow('Cannot validate GraphQL schema')
    })

    it('throws error if Headless Login plugin is not detected', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Query {
          posts: [Post]
        }
        ${' '.repeat(100)}
      `)

      expect(() => validateAuthSchema('/path/to/schema.graphql'))
        .toThrow('Headless Login for WPGraphQL plugin not detected')
    })

    it('does not throw if Headless Login is detected', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Query {
          loginClients: [LoginClient]
        }
        ${' '.repeat(100)}
      `)

      expect(() => validateAuthSchema('/path/to/schema.graphql')).not.toThrow()
    })

    it('throws error if password auth is required but not available', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Query {
          loginClients: [LoginClient]
        }
        ${' '.repeat(100)}
      `)

      expect(() => validateAuthSchema('/path/to/schema.graphql', { requirePassword: true }))
        .toThrow('Password authentication not available')
    })

    it('does not throw if password auth is required and available', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Query {
          loginClients: [LoginClient]
        }
        type Mutation {
          login(input: LoginInput!): LoginPayload
        }
        input LoginInput {
          username: String!
        }
        ${' '.repeat(100)}
      `)

      expect(() => validateAuthSchema('/path/to/schema.graphql', { requirePassword: true }))
        .not.toThrow()
    })

    it('throws error if headless login is required but no providers detected', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Query {
          loginClients: [LoginClient]
        }
        ${' '.repeat(100)}
      `)

      expect(() => validateAuthSchema('/path/to/schema.graphql', { requireHeadlessLogin: true }))
        .toThrow('No OAuth providers detected')
    })

    it('does not throw if headless login is required and providers exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(`
        type Query {
          loginClients: [LoginClient]
        }
        enum LoginProviderEnum {
          GOOGLE
        }
        ${' '.repeat(100)}
      `)

      expect(() => validateAuthSchema('/path/to/schema.graphql', { requireHeadlessLogin: true }))
        .not.toThrow()
    })
  })
})
