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
      expect(result[0]?.name).toBe('TestQuery')
      expect(result[0]?.operation).toBe('query')
      expect(result[0]?.nodes).toContain('posts')
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
      expect(result[0]?.fragments).toContain('PostFragment')
    })

    it('should throw error for empty document', async () => {
      await expect(parseDoc('')).rejects.toThrow('Invalid GraphQL document')
    })

    it('should throw error for null/undefined document', async () => {
      await expect(parseDoc(null as unknown as string)).rejects.toThrow('Invalid GraphQL document')
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
      expect(result[0]?.name).toBe('FirstQuery')
      expect(result[1]?.name).toBe('SecondQuery')
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
      expect(result[0]?.name).toBe('PostById')
    })

    it('should parse mutations', async () => {
      const doc = `
        mutation Login($username: String!, $password: String!) {
          login(input: { username: $username, password: $password }) {
            authToken
            refreshToken
          }
        }
      `
      const result = await parseDoc(doc)
      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('Login')
      expect(result[0]?.operation).toBe('mutation')
    })

    it('should handle mixed queries and mutations', async () => {
      const doc = `
        query GetUser {
          viewer {
            id
            name
          }
        }

        mutation UpdateUser($name: String!) {
          updateUser(input: { name: $name }) {
            user {
              id
              name
            }
          }
        }
      `
      const result = await parseDoc(doc)
      expect(result).toHaveLength(2)
      expect(result[0]?.operation).toBe('query')
      expect(result[1]?.operation).toBe('mutation')
    })

    it('should handle deeply nested selections', async () => {
      const doc = `
        query DeepQuery {
          posts {
            nodes {
              author {
                node {
                  name
                }
              }
            }
          }
        }
      `
      const result = await parseDoc(doc)
      expect(result).toHaveLength(1)
      expect(result[0]?.nodes).toContain('posts')
    })

    it('should handle multiple fragments', async () => {
      const doc = `
        query PostWithFragments {
          post(id: "1") {
            ...PostFields
            ...AuthorFields
            ...MediaFields
          }
        }
      `
      const result = await parseDoc(doc)
      expect(result).toHaveLength(1)
      expect(result[0]?.fragments).toContain('PostFields')
      expect(result[0]?.fragments).toContain('AuthorFields')
      expect(result[0]?.fragments).toContain('MediaFields')
    })

    it('should handle whitespace-only document', async () => {
      const doc = `

      `
      await expect(parseDoc(doc)).rejects.toThrow('Invalid GraphQL document')
    })

    it('should throw specific error for fragment-only document', async () => {
      const doc = `
        fragment PostFields on Post {
          id
          title
        }
      `
      const result = await parseDoc(doc)
      // Fragment definitions are filtered out, so result should be empty
      expect(result).toHaveLength(0)
    })
  })
})
