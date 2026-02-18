import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'graphql'
import { patchSchemaText } from '../src/utils/endpointValidation'

/**
 * Extract the list of interface names from all `implements` clauses in a schema string.
 */
function getImplementedInterfaces(schema: string): string[] {
  const interfaces: string[] = []
  const lines = schema.split('\n')
  for (const line of lines) {
    const match = line.match(/implements\s+([^{]+)/)
    if (match?.[1]) {
      interfaces.push(...match[1].split('&').map(s => s.trim()))
    }
  }
  return interfaces
}

describe('patchSchemaText', () => {
  it('should remove a sole problematic interface', () => {
    const schema = `
      type MyConnection implements Connection {
        nodes: [String!]!
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).not.toContain('Connection')
    expect(result).toContain('MyConnection')
    expect(() => parse(result)).not.toThrow()
  })

  it('should remove a problematic interface at the start of a list', () => {
    const schema = `
      type MyConnection implements Connection & Node {
        nodes: [String!]!
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).not.toContain('Connection')
    expect(ifaces).toContain('Node')
    expect(() => parse(result)).not.toThrow()
  })

  it('should remove a problematic interface at the end of a list', () => {
    const schema = `
      type MyConnection implements Node & Connection {
        nodes: [String!]!
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).not.toContain('Connection')
    expect(ifaces).toContain('Node')
    expect(() => parse(result)).not.toThrow()
  })

  it('should remove a problematic interface in the middle of a list', () => {
    const schema = `
      type MyConnection implements Node & Connection & DatabaseIdentifier {
        nodes: [String!]!
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).not.toContain('Connection')
    expect(ifaces).toContain('Node')
    expect(ifaces).toContain('DatabaseIdentifier')
    expect(() => parse(result)).not.toThrow()
  })

  it('should remove multiple problematic interfaces from the same type', () => {
    const schema = `
      type MyEdge implements Edge & Connection & Node {
        node: String!
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).not.toContain('Edge')
    expect(ifaces).not.toContain('Connection')
    expect(ifaces).toContain('Node')
    expect(() => parse(result)).not.toThrow()
  })

  it('should remove OneToOneConnection interface', () => {
    const schema = `
      type MyEdge implements OneToOneConnection & Node {
        node: String!
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).not.toContain('OneToOneConnection')
    expect(ifaces).toContain('Node')
    expect(() => parse(result)).not.toThrow()
  })

  it('should remove NodeWithEditorBlocks interface', () => {
    const schema = `
      type Post implements Node & NodeWithEditorBlocks & ContentNode {
        id: ID!
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).not.toContain('NodeWithEditorBlocks')
    expect(ifaces).toContain('Node')
    expect(ifaces).toContain('ContentNode')
    expect(() => parse(result)).not.toThrow()
  })

  it('should handle interface definitions (not just types)', () => {
    const schema = `
      interface CategoryConnection implements Connection {
        nodes: [String!]!
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).not.toContain('Connection')
    expect(result).toContain('CategoryConnection')
    expect(() => parse(result)).not.toThrow()
  })

  it('should not modify types without problematic interfaces', () => {
    const schema = `
      type Post implements Node & ContentNode & DatabaseIdentifier {
        id: ID!
        title: String
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).toContain('Node')
    expect(ifaces).toContain('ContentNode')
    expect(ifaces).toContain('DatabaseIdentifier')
    expect(() => parse(result)).not.toThrow()
  })

  it('should not modify types without any interfaces', () => {
    const schema = `
      type Query {
        posts: [String!]!
      }
    `
    const result = patchSchemaText(schema)
    expect(result).toContain('Query')
    expect(result).toContain('posts')
    expect(() => parse(result)).not.toThrow()
  })

  it('should handle a schema with multiple types', () => {
    const schema = `
      type MyConnection implements Connection {
        nodes: [String!]!
      }

      type Post implements Node & ContentNode {
        id: ID!
      }

      type MyEdge implements Edge {
        node: String!
      }
    `
    const result = patchSchemaText(schema)
    const ifaces = getImplementedInterfaces(result)
    expect(ifaces).not.toContain('Connection')
    expect(ifaces).not.toContain('Edge')
    expect(ifaces).toContain('Node')
    expect(ifaces).toContain('ContentNode')
    expect(() => parse(result)).not.toThrow()
  })

  it('should produce valid GraphQL when patching a real schema file', () => {
    const schemaPath = join(__dirname, 'fixtures/basic/schema.graphql')

    if (existsSync(schemaPath)) {
      const schema = readFileSync(schemaPath, 'utf-8')
      const result = patchSchemaText(schema)
      // Must be valid GraphQL
      expect(() => parse(result)).not.toThrow()
      // Problematic interfaces should be removed from implements clauses
      const ifaces = getImplementedInterfaces(result)
      expect(ifaces).not.toContain('Connection')
      expect(ifaces).not.toContain('Edge')
      expect(ifaces).not.toContain('OneToOneConnection')
      expect(ifaces).not.toContain('NodeWithEditorBlocks')
    }
  })
})
