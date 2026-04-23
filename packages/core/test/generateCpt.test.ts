import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildCptFragment, buildCptQueries, writeCptArtifacts } from '../src/utils/generateCpt'
import type { DiscoveredCpt } from '../src/utils/cptDiscovery'

const FULL_EVENT_CPT: DiscoveredCpt = {
  typeName: 'Event',
  singleField: 'event',
  connectionField: 'events',
  idTypeEnum: 'EventIdType',
  supportedIdTypes: new Set(['DATABASE_ID', 'ID', 'SLUG', 'URI']),
  interfaces: new Set([
    'ContentNode',
    'NodeWithTitle',
    'NodeWithExcerpt',
    'NodeWithContentEditor',
    'NodeWithFeaturedImage'
  ]),
  hasField: { title: true, slug: true, uri: true, date: true }
}

describe('buildCptFragment', () => {
  it('includes ContentNode + every NodeWith* spread the type implements', () => {
    const fragment = buildCptFragment(FULL_EVENT_CPT)
    expect(fragment).toContain('fragment Event on Event {')
    expect(fragment).toContain('  ...ContentNode')
    expect(fragment).toContain('  ...NodeWithExcerpt')
    expect(fragment).toContain('  ...NodeWithContentEditor')
    expect(fragment).toContain('  ...NodeWithFeaturedImage')
    expect(fragment).toContain('  title')
  })

  it('omits spreads for interfaces the type does not implement', () => {
    const minimal: DiscoveredCpt = {
      ...FULL_EVENT_CPT,
      interfaces: new Set(['ContentNode']),
      hasField: { title: false, slug: true, uri: true, date: true }
    }
    const fragment = buildCptFragment(minimal)
    expect(fragment).toContain('  ...ContentNode')
    expect(fragment).not.toContain('NodeWithExcerpt')
    expect(fragment).not.toContain('NodeWithContentEditor')
    expect(fragment).not.toContain('NodeWithFeaturedImage')
    expect(fragment).not.toContain('  title')
  })
})

describe('buildCptQueries', () => {
  it('emits a connection query named after the plural field', () => {
    const q = buildCptQueries(FULL_EVENT_CPT)
    expect(q).toContain('query Events($first: Int = 20, $after: String) {')
    expect(q).toContain('  events(first: $first, after: $after) {')
    expect(q).toContain('      ...Event')
    expect(q).toContain('    pageInfo {')
    expect(q).toContain('      hasNextPage')
  })

  it('emits a ByUri query when the idType enum contains URI', () => {
    const q = buildCptQueries(FULL_EVENT_CPT)
    expect(q).toContain('query EventByUri($uri: ID!) {')
    expect(q).toContain('  event(id: $uri, idType: URI) {')
  })

  it('emits a BySlug query when the idType enum contains SLUG', () => {
    const q = buildCptQueries(FULL_EVENT_CPT)
    expect(q).toContain('query EventBySlug($slug: ID!) {')
    expect(q).toContain('  event(id: $slug, idType: SLUG) {')
  })

  it('omits the ByUri query when URI is not in the idType enum', () => {
    const noUri: DiscoveredCpt = {
      ...FULL_EVENT_CPT,
      supportedIdTypes: new Set(['DATABASE_ID', 'ID', 'SLUG'])
    }
    const q = buildCptQueries(noUri)
    expect(q).not.toContain('ByUri')
    expect(q).toContain('BySlug')
  })

  it('omits the BySlug query when SLUG is not in the idType enum', () => {
    const noSlug: DiscoveredCpt = {
      ...FULL_EVENT_CPT,
      supportedIdTypes: new Set(['DATABASE_ID', 'ID', 'URI'])
    }
    const q = buildCptQueries(noSlug)
    expect(q).not.toContain('BySlug')
    expect(q).toContain('ByUri')
  })
})

describe('writeCptArtifacts', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'wpnuxt-gen-'))
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('writes Event.fragment.gql and Events.gql (plural) into the output folder', async () => {
    const result = await writeCptArtifacts(FULL_EVENT_CPT, tmpDir)
    expect(result.wroteFragment).toBe(true)
    expect(result.wroteQueries).toBe(true)
    expect(existsSync(join(tmpDir, 'fragments/Event.fragment.gql'))).toBe(true)
    expect(existsSync(join(tmpDir, 'Events.gql'))).toBe(true)
  })

  it('does not overwrite an existing fragment file', async () => {
    const { mkdirSync } = await import('node:fs')
    mkdirSync(join(tmpDir, 'fragments'), { recursive: true })
    writeFileSync(join(tmpDir, 'fragments/Event.fragment.gql'), 'USER FRAGMENT', 'utf8')
    const result = await writeCptArtifacts(FULL_EVENT_CPT, tmpDir)
    expect(result.wroteFragment).toBe(false)
    expect(readFileSync(join(tmpDir, 'fragments/Event.fragment.gql'), 'utf8')).toBe('USER FRAGMENT')
  })

  it('does not overwrite an existing query file', async () => {
    writeFileSync(join(tmpDir, 'Events.gql'), 'USER QUERIES', 'utf8')
    const result = await writeCptArtifacts(FULL_EVENT_CPT, tmpDir)
    expect(result.wroteQueries).toBe(false)
    expect(readFileSync(join(tmpDir, 'Events.gql'), 'utf8')).toBe('USER QUERIES')
  })
})
