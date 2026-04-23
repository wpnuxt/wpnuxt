import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DEFAULT_CPT_EXCLUSIONS, discoverCpts } from '../src/utils/cptDiscovery'

/**
 * Minimal schema fixture that exercises the discovery logic:
 * - `Event` (user CPT) — has single + connection RootQuery fields + idType enum with URI/SLUG
 * - `Post` (built-in) — should be auto-excluded
 * - `Venue` (user CPT) — no connection field → should be skipped
 * - `NotAContentNode` — does not implement ContentNode → skipped
 */
const SCHEMA_SDL = `
interface ContentNode {
  id: ID!
}

type Event implements ContentNode & NodeWithTitle & NodeWithExcerpt & NodeWithFeaturedImage {
  id: ID!
  title: String
  slug: String
  uri: String
  date: String
}

type Post implements ContentNode & NodeWithTitle {
  id: ID!
  title: String
}

type Venue implements ContentNode {
  id: ID!
  title: String
}

type NotAContentNode {
  id: ID!
}

enum EventIdType {
  DATABASE_ID
  ID
  SLUG
  URI
}

enum PostIdType {
  DATABASE_ID
  ID
  SLUG
  URI
}

enum VenueIdType {
  DATABASE_ID
  ID
}

type RootQueryToEventConnection {
  nodes: [Event!]!
}

type RootQueryToPostConnection {
  nodes: [Post!]!
}

type RootQuery {
  event(id: ID!, idType: EventIdType): Event
  events(first: Int, after: String): RootQueryToEventConnection
  post(id: ID!, idType: PostIdType): Post
  posts(first: Int, after: String): RootQueryToPostConnection
  venue(id: ID!, idType: VenueIdType): Venue
}
`

describe('discoverCpts', () => {
  let tmpDir: string
  let schemaPath: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'wpnuxt-discover-'))
    schemaPath = join(tmpDir, 'schema.graphql')
    writeFileSync(schemaPath, SCHEMA_SDL, 'utf8')
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('returns [] when the schema file is missing', () => {
    expect(discoverCpts(join(tmpDir, 'missing.graphql'))).toEqual([])
  })

  it('returns [] when the schema is malformed', () => {
    writeFileSync(schemaPath, 'this is not graphql', 'utf8')
    expect(discoverCpts(schemaPath)).toEqual([])
  })

  it('finds Custom Post Types that implement ContentNode with matching RootQuery fields', () => {
    const cpts = discoverCpts(schemaPath)
    expect(cpts.map(c => c.typeName)).toEqual(['Event'])
  })

  it('extracts RootQuery field names and idType metadata', () => {
    const [event] = discoverCpts(schemaPath)
    expect(event).toBeDefined()
    expect(event!.singleField).toBe('event')
    expect(event!.connectionField).toBe('events')
    expect(event!.idTypeEnum).toBe('EventIdType')
    expect(event!.supportedIdTypes).toEqual(new Set(['DATABASE_ID', 'ID', 'SLUG', 'URI']))
  })

  it('records the interfaces each CPT implements', () => {
    const [event] = discoverCpts(schemaPath)
    expect(event!.interfaces.has('ContentNode')).toBe(true)
    expect(event!.interfaces.has('NodeWithTitle')).toBe(true)
    expect(event!.interfaces.has('NodeWithExcerpt')).toBe(true)
    expect(event!.interfaces.has('NodeWithFeaturedImage')).toBe(true)
    expect(event!.interfaces.has('NodeWithContentEditor')).toBe(false)
  })

  it('records which scalar fields the type declares directly', () => {
    const [event] = discoverCpts(schemaPath)
    expect(event!.hasField.title).toBe(true)
    expect(event!.hasField.slug).toBe(true)
    expect(event!.hasField.uri).toBe(true)
    expect(event!.hasField.date).toBe(true)
  })

  it('excludes built-in types like Post by default', () => {
    const names = discoverCpts(schemaPath).map(c => c.typeName)
    for (const excluded of DEFAULT_CPT_EXCLUSIONS) {
      expect(names).not.toContain(excluded)
    }
  })

  it('skips types without both single + connection RootQuery fields', () => {
    // Venue has a single-fetch field but no connection
    const names = discoverCpts(schemaPath).map(c => c.typeName)
    expect(names).not.toContain('Venue')
  })

  it('respects the exclude option', () => {
    const cpts = discoverCpts(schemaPath, { exclude: ['Event'] })
    expect(cpts).toEqual([])
  })

  it('respects the include option (allowlist)', () => {
    const cpts = discoverCpts(schemaPath, { include: ['Artist'] })
    // Event present but not in include list
    expect(cpts.map(c => c.typeName)).toEqual([])
  })
})
