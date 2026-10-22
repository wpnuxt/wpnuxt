import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import type { NuxtLogger } from '@nuxt/kit'
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { createResolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import type { WPNuxtConfig } from '../src/types/config'
import { mergeQueries, initLogger } from '../src/utils/index'

const TEST_DIR = join(__dirname, '.tmp-merge-queries')
const SRC_DIR = join(TEST_DIR, 'app')
const PACKAGE_DIR = join(TEST_DIR, 'package')
const DEFAULTS_DIR = join(PACKAGE_DIR, 'runtime', 'queries')
const CONTRIB_DIR = join(TEST_DIR, 'contrib')
const USER_DIR = join(SRC_DIR, 'extend', 'queries')
const OUTPUT_DIR = join(SRC_DIR, '.queries')

const DEFAULT_POST_FRAGMENT = 'fragment Post on Post {\n  title\n}\n'
const CONTRIB_POST_FRAGMENT = 'fragment Post on Post {\n  title\n  ...NodeWithEditorBlocks\n}\n'
const USER_POST_FRAGMENT = 'fragment Post on Post {\n  title\n  userCustomField\n}\n'

const nuxt = { options: { srcDir: SRC_DIR, rootDir: TEST_DIR } } as Nuxt

const config = {
  queries: {
    extendFolder: 'extend/queries/',
    mergedOutputFolder: '.queries/',
    warnOnOverride: false
  },
  cpt: { enabled: false }
} as WPNuxtConfig

function readOutput(relativePath: string): string {
  return readFileSync(join(OUTPUT_DIR, relativePath), 'utf-8')
}

function runMergeQueries(contributedFolders: string[] = []) {
  return mergeQueries(nuxt, config, createResolver(PACKAGE_DIR), undefined, contributedFolders)
}

function runMergeQueriesWithWarnings(contributedFolders: string[] = []) {
  const warningConfig = { ...config, queries: { ...config.queries, warnOnOverride: true } } as WPNuxtConfig
  return mergeQueries(nuxt, warningConfig, createResolver(PACKAGE_DIR), undefined, contributedFolders)
}

describe('mergeQueries', () => {
  let logger: NuxtLogger

  beforeAll(() => {
    logger = initLogger(false)
    logger.mockTypes(() => vi.fn())
  })

  beforeEach(() => {
    (logger.warn as unknown as ReturnType<typeof vi.fn>).mockClear()
    mkdirSync(join(DEFAULTS_DIR, 'fragments'), { recursive: true })
    writeFileSync(join(DEFAULTS_DIR, 'Posts.gql'), 'query Posts {\n  posts {\n    nodes {\n      ...Post\n    }\n  }\n}\n')
    writeFileSync(join(DEFAULTS_DIR, 'fragments', 'Post.fragment.gql'), DEFAULT_POST_FRAGMENT)
    mkdirSync(SRC_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true })
  })

  it('copies default queries to the output folder', async () => {
    const output = await runMergeQueries()

    expect(output).toBe(OUTPUT_DIR)
    expect(readOutput('Posts.gql')).toContain('query Posts')
    expect(readOutput('fragments/Post.fragment.gql')).toBe(DEFAULT_POST_FRAGMENT)
  })

  it('copies contributed folders into the output folder', async () => {
    mkdirSync(join(CONTRIB_DIR, 'fragments'), { recursive: true })
    writeFileSync(join(CONTRIB_DIR, 'fragments', 'EditorBlock.fragment.gql'), 'fragment EditorBlock on EditorBlock {\n  name\n}\n')

    await runMergeQueries([CONTRIB_DIR])

    expect(readOutput('fragments/EditorBlock.fragment.gql')).toContain('fragment EditorBlock')
  })

  it('lets contributed fragments override default fragments', async () => {
    mkdirSync(join(CONTRIB_DIR, 'fragments'), { recursive: true })
    writeFileSync(join(CONTRIB_DIR, 'fragments', 'Post.fragment.gql'), CONTRIB_POST_FRAGMENT)

    await runMergeQueries([CONTRIB_DIR])

    expect(readOutput('fragments/Post.fragment.gql')).toBe(CONTRIB_POST_FRAGMENT)
  })

  it('lets user extend queries override contributed fragments', async () => {
    mkdirSync(join(CONTRIB_DIR, 'fragments'), { recursive: true })
    writeFileSync(join(CONTRIB_DIR, 'fragments', 'Post.fragment.gql'), CONTRIB_POST_FRAGMENT)
    mkdirSync(join(USER_DIR, 'fragments'), { recursive: true })
    writeFileSync(join(USER_DIR, 'fragments', 'Post.fragment.gql'), USER_POST_FRAGMENT)

    await runMergeQueries([CONTRIB_DIR])

    expect(readOutput('fragments/Post.fragment.gql')).toBe(USER_POST_FRAGMENT)
  })

  it('only copies .gql and .graphql files from contributed folders', async () => {
    mkdirSync(join(CONTRIB_DIR, 'fragments'), { recursive: true })
    writeFileSync(join(CONTRIB_DIR, 'README.md'), '# Not a query\n')
    writeFileSync(join(CONTRIB_DIR, 'fragments', 'EditorBlock.fragment.gql'), 'fragment EditorBlock on EditorBlock {\n  name\n}\n')

    await runMergeQueries([CONTRIB_DIR])

    expect(existsSync(join(OUTPUT_DIR, 'README.md'))).toBe(false)
    expect(existsSync(join(OUTPUT_DIR, 'fragments', 'EditorBlock.fragment.gql'))).toBe(true)
  })

  it('skips contributed folders that do not exist', async () => {
    await runMergeQueries([join(TEST_DIR, 'does-not-exist')])

    expect(readOutput('fragments/Post.fragment.gql')).toBe(DEFAULT_POST_FRAGMENT)
  })

  it('warns when user files override shipped default queries', async () => {
    mkdirSync(join(USER_DIR, 'fragments'), { recursive: true })
    writeFileSync(join(USER_DIR, 'fragments', 'Post.fragment.gql'), USER_POST_FRAGMENT)

    await runMergeQueriesWithWarnings()

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('fragments/Post.fragment.gql'))
  })

  it('does not warn when user files override contributed queries', async () => {
    mkdirSync(join(CONTRIB_DIR, 'fragments'), { recursive: true })
    writeFileSync(join(CONTRIB_DIR, 'fragments', 'EditorBlock.fragment.gql'), 'fragment EditorBlock on EditorBlock {\n  name\n}\n')
    mkdirSync(join(USER_DIR, 'fragments'), { recursive: true })
    writeFileSync(join(USER_DIR, 'fragments', 'EditorBlock.fragment.gql'), 'fragment EditorBlock on EditorBlock {\n  name\n  clientId\n}\n')

    await runMergeQueriesWithWarnings([CONTRIB_DIR])

    expect(logger.warn).not.toHaveBeenCalled()
    expect(readOutput('fragments/EditorBlock.fragment.gql')).toContain('clientId')
  })
})
