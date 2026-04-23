import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { validateGeneratedPaths } from '../src/utils/validateGenerated'

function writeOperationsFile(dir: string, content: string): string {
  const path = join(dir, 'graphql-operations.d.ts')
  writeFileSync(path, content, 'utf8')
  return path
}

describe('validateGeneratedPaths', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'wpnuxt-validate-'))
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('returns skipped when the operations file does not exist', () => {
    const result = validateGeneratedPaths(
      ['PostsQueryVariables', 'PostFragment'],
      join(tmpDir, 'nope.d.ts')
    )
    expect(result.skipped).toBe(true)
    expect(result.dangling).toEqual([])
  })

  it('flags references not declared in the operations file', () => {
    const path = writeOperationsFile(tmpDir, `
      export interface PostsQueryVariables { limit?: number }
      export type PostFragment = { id: string }
    `)
    const result = validateGeneratedPaths(
      ['PostsQueryVariables', 'PostFragment', 'GhostFragment', 'RenamedRootQuery'],
      path
    )
    expect(result.skipped).toBe(false)
    expect(result.dangling).toEqual(['GhostFragment', 'RenamedRootQuery'])
  })

  it('returns an empty dangling list when every reference exists', () => {
    const path = writeOperationsFile(tmpDir, `
      export interface PostsRootQuery { posts?: unknown }
      export interface PostsQueryVariables { first?: number }
      export type PostFragment = { id: string }
    `)
    const result = validateGeneratedPaths(
      ['PostsRootQuery', 'PostsQueryVariables', 'PostFragment'],
      path
    )
    expect(result.skipped).toBe(false)
    expect(result.dangling).toEqual([])
  })

  it('deduplicates repeated references', () => {
    const path = writeOperationsFile(tmpDir, 'export type PostFragment = { id: string }')
    const result = validateGeneratedPaths(
      ['MissingFragment', 'MissingFragment', 'MissingFragment'],
      path
    )
    expect(result.dangling).toEqual(['MissingFragment'])
  })

  it('recognizes symbols declared inside declare module blocks', () => {
    const path = writeOperationsFile(tmpDir, `
      declare module 'nuxt-graphql-middleware/generated-types' {
        export interface PostsQueryVariables { first?: number }
        export type PostFragment = { id: string }
      }
    `)
    const result = validateGeneratedPaths(
      ['PostsQueryVariables', 'PostFragment'],
      path
    )
    expect(result.dangling).toEqual([])
  })

  it('recognizes const declarations', () => {
    const path = writeOperationsFile(tmpDir, `
      export const PostsDocument = {} as const
    `)
    const result = validateGeneratedPaths(
      ['PostsDocument', 'MissingDocument'],
      path
    )
    expect(result.dangling).toEqual(['MissingDocument'])
  })
})
