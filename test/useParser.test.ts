import { describe, it, expect } from 'vitest'
import { parseDoc } from '../src/utils/useParser'

describe('useParser', () => {
  describe('parseDoc', () => {
    it('should parse a valid GraphQL query', async () => {
      const doc = `
        query TestQuery {
          posts {
            nodes {
              id
              title
            }
          }
        }
      `
      const result = await parseDoc(doc)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('TestQuery')
      expect(result[0].operation).toBe('query')
      expect(result[0].nodes).toContain('posts')
    })

    it('should parse queries with fragments', async () => {
      const doc = `
        query PostsQuery {
          posts {
            nodes {
              ...PostFragment
            }
          }
        }
      `
      const result = await parseDoc(doc)
      expect(result).toHaveLength(1)
      expect(result[0].fragments).toContain('PostFragment')
    })

    it('should throw error for empty document', async () => {
      await expect(parseDoc('')).rejects.toThrow('Invalid GraphQL document')
    })

    it('should throw error for null/undefined document', async () => {
      await expect(parseDoc(null as any)).rejects.toThrow('Invalid GraphQL document')
    })

    it('should throw error for query without name', async () => {
      const doc = `
        query {
          posts {
            nodes {
              id
            }
          }
        }
      `
      await expect(parseDoc(doc)).rejects.toThrow('missing a name')
    })

    it('should throw error for malformed GraphQL', async () => {
      const doc = `
        query InvalidQuery {
          posts {
            nodes
        }
      `
      await expect(parseDoc(doc)).rejects.toThrow('Failed to parse GraphQL document')
    })

    it('should parse multiple queries in one document', async () => {
      const doc = `
        query FirstQuery {
          posts {
            nodes {
              id
            }
          }
        }

        query SecondQuery {
          pages {
            nodes {
              id
            }
          }
        }
      `
      const result = await parseDoc(doc)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('FirstQuery')
      expect(result[1].name).toBe('SecondQuery')
    })

    it('should handle queries with variables', async () => {
      const doc = `
        query PostById($id: ID!) {
          post(id: $id) {
            id
            title
          }
        }
      `
      const result = await parseDoc(doc)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('PostById')
    })
  })
})
