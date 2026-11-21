import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { useLogger } from '@nuxt/kit'
import { addCustomFragmentsToNodeQuery } from '../src/utils/index'

const TEST_DIR = join(__dirname, '.tmp-custom-fragments')
const QUERIES_DIR = join(TEST_DIR, 'queries')
const USER_DIR = join(TEST_DIR, 'extend')

const NODE_GQL_CONTENT = `query NodeByUri($uri: String!) {
  nodeByUri(uri: $uri) {
    __typename
    ...Page
    ...Post
  }
}
`

const logger = useLogger('wpnuxt-test', { level: 0 })

function writeFragment(dir: string, filename: string, content: string) {
  const fragmentsDir = join(dir, 'fragments')
  mkdirSync(fragmentsDir, { recursive: true })
  writeFileSync(join(fragmentsDir, filename), content)
}

function readNodeGql(): string {
  return readFileSync(join(QUERIES_DIR, 'Node.gql'), 'utf-8')
}

describe('addCustomFragmentsToNodeQuery', () => {
  beforeEach(() => {
    mkdirSync(QUERIES_DIR, { recursive: true })
    writeFileSync(join(QUERIES_DIR, 'Node.gql'), NODE_GQL_CONTENT)
  })

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true })
  })

  it('should add content type fragment to NodeByUri', async () => {
    writeFragment(USER_DIR, 'Event.fragment.gql', 'fragment Event on Event {\n  title\n  startDate\n}\n')

    await addCustomFragmentsToNodeQuery(QUERIES_DIR, USER_DIR, logger)

    const result = readNodeGql()
    expect(result).toContain('... on Event { ...Event }')
    expect(result).toContain('...Page')
    expect(result).toContain('...Post')
  })

  it('should add only known post types to ContentNodeById', async () => {
    const contentNodeQuery = `
query ContentNodeById($id: ID!) {
  contentNode(id: $id, idType: DATABASE_ID) {
    __typename
    ...Page
    ...Post
  }
}
`
    writeFileSync(join(QUERIES_DIR, 'Node.gql'), NODE_GQL_CONTENT + contentNodeQuery)
    // Scanned from the user folder: may be a taxonomy, so NodeByUri only
    writeFragment(USER_DIR, 'Genre.fragment.gql', 'fragment Genre on Genre {\n  name\n}\n')
    // Also discovered as a post type: the user fragment keeps the flag
    writeFragment(USER_DIR, 'Event.fragment.gql', 'fragment Event on Event {\n  title\n}\n')

    await addCustomFragmentsToNodeQuery(QUERIES_DIR, USER_DIR, logger, [
      { name: 'Category', type: 'Category' },
      { name: 'Event', type: 'Event', isContentNode: true }
    ])

    const [nodeByUri, contentNodeById] = readNodeGql().split('query ContentNodeById')
    expect(nodeByUri).toContain('... on Category { ...Category }')
    expect(nodeByUri).toContain('... on Genre { ...Genre }')
    expect(nodeByUri).toContain('... on Event { ...Event }')
    expect(contentNodeById).toContain('... on Event { ...Event }')
    expect(contentNodeById).not.toContain('Category')
    expect(contentNodeById).not.toContain('Genre')
  })

  it('should add multiple custom content type fragments', async () => {
    writeFragment(USER_DIR, 'Event.fragment.gql', 'fragment Event on Event {\n  title\n}\n')
    writeFragment(USER_DIR, 'Artist.fragment.gql', 'fragment Artist on Artist {\n  name\n}\n')
    writeFragment(USER_DIR, 'Venue.fragment.gql', 'fragment Venue on Venue {\n  address\n}\n')

    await addCustomFragmentsToNodeQuery(QUERIES_DIR, USER_DIR, logger)

    const result = readNodeGql()
    expect(result).toContain('... on Event { ...Event }')
    expect(result).toContain('... on Artist { ...Artist }')
    expect(result).toContain('... on Venue { ...Venue }')
  })

  it('should not add mixin fragments (name !== type)', async () => {
    writeFragment(USER_DIR, 'NodeWithEditorBlocks.fragment.gql', 'fragment NodeWithEditorBlocks on ContentNode {\n  editorBlocks\n}\n')

    await addCustomFragmentsToNodeQuery(QUERIES_DIR, USER_DIR, logger)

    const result = readNodeGql()
    expect(result).not.toContain('NodeWithEditorBlocks')
    expect(result).toBe(NODE_GQL_CONTENT)
  })

  it('should not modify Node.gql when no user fragments dir exists', async () => {
    await addCustomFragmentsToNodeQuery(QUERIES_DIR, join(TEST_DIR, 'nonexistent'), logger)

    const result = readNodeGql()
    expect(result).toBe(NODE_GQL_CONTENT)
  })

  it('should not modify Node.gql when user has no content type fragments', async () => {
    writeFragment(USER_DIR, 'CustomFields.fragment.gql', 'fragment CustomFields on Post {\n  customField\n}\n')

    await addCustomFragmentsToNodeQuery(QUERIES_DIR, USER_DIR, logger)

    const result = readNodeGql()
    expect(result).toBe(NODE_GQL_CONTENT)
  })

  it('should handle .graphql extension', async () => {
    writeFragment(USER_DIR, 'Event.fragment.graphql', 'fragment Event on Event {\n  title\n}\n')

    await addCustomFragmentsToNodeQuery(QUERIES_DIR, USER_DIR, logger)

    const result = readNodeGql()
    expect(result).toContain('... on Event { ...Event }')
  })

  it('should produce valid GraphQL structure', async () => {
    writeFragment(USER_DIR, 'Event.fragment.gql', 'fragment Event on Event {\n  title\n}\n')

    await addCustomFragmentsToNodeQuery(QUERIES_DIR, USER_DIR, logger)

    const result = readNodeGql()
    // Should have proper indentation and closing braces
    expect(result).toMatch(/\.\.\. on Event \{ \.\.\.Event \}\n\s+\}\n\}/)
  })
})
