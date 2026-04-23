import { existsSync, cpSync, mkdirSync, promises as fsp, readdirSync, statSync } from 'node:fs'
import { rename, writeFile } from 'node:fs/promises'
import { relative, join } from 'node:path'
import { createResolver, useLogger } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { ConsolaInstance } from 'consola'
import type { Nuxt } from 'nuxt/schema'
import type { WPNuxtConfig } from '../types/config'
import { discoverCpts } from './cptDiscovery'
import { writeCptArtifacts } from './generateCpt'

// Re-export error utilities
export { createModuleError, formatErrorMessage, type WPNuxtModule } from './errors'

/**
 * Validates and normalizes a WordPress URL.
 *
 * - Adds https:// prefix if no protocol is specified
 * - Validates URL format and protocol (http/https only)
 * - Removes trailing slashes
 *
 * @param url - The URL to validate
 * @returns Validation result with normalized URL or error message
 */
export function validateWordPressUrl(url: string): { valid: boolean, error?: string, normalizedUrl?: string } {
  if (!url?.trim()) {
    return { valid: false, error: 'URL cannot be empty' }
  }

  let normalizedUrl = url.trim()

  // Add https:// if no protocol specified
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`
  }

  try {
    const parsed = new URL(normalizedUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https protocol' }
    }
    // Remove trailing slashes
    return { valid: true, normalizedUrl: normalizedUrl.replace(/\/+$/, '') }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Writes a file atomically using a temp file and rename.
 *
 * This ensures that if the write fails partway through, the original
 * file remains intact. The rename operation is atomic on most filesystems.
 *
 * @param path - The target file path
 * @param content - The content to write
 */
export async function atomicWriteFile(path: string, content: string): Promise<void> {
  const tempPath = `${path}.${Date.now()}.tmp`
  await writeFile(tempPath, content, 'utf-8')
  await rename(tempPath, path)
}

export function randHashGenerator(length = 12) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase()
    .padEnd(length, '0')
}

let loggerInstance: ConsolaInstance | undefined

export const initLogger = (debug: boolean) => {
  loggerInstance = useLogger('wpnuxt', { level: debug ? 4 : 3 })
  return loggerInstance
}
export function getLogger(): ConsolaInstance {
  return loggerInstance!
}

export async function mergeQueries(
  nuxt: Nuxt,
  wpNuxtConfig: WPNuxtConfig,
  resolver: Resolver,
  schemaPath?: string
) {
  const logger = getLogger()

  // Cache base directory
  const baseDir = nuxt.options.srcDir || nuxt.options.rootDir
  const { resolve } = createResolver(baseDir)
  const queryOutputPath = resolve(wpNuxtConfig.queries.mergedOutputFolder)
  const userQueryPath = resolve(wpNuxtConfig.queries.extendFolder)
  const defaultQueriesPath = resolver.resolve('./runtime/queries')

  // Clean output directory
  await fsp.rm(queryOutputPath, { recursive: true, force: true })

  // Copy default queries
  cpSync(defaultQueriesPath, queryOutputPath, { recursive: true })

  // Auto-generate fragments + queries for Custom Post Types discovered in
  // the downloaded schema. Runs BEFORE the user override copy so users can
  // still override any generated file by dropping one in extend/queries/.
  const cptSpreads: ContentTypeFragment[] = []
  if (schemaPath && wpNuxtConfig.cpt?.enabled !== false) {
    const cpts = discoverCpts(schemaPath, {
      exclude: wpNuxtConfig.cpt?.exclude,
      include: wpNuxtConfig.cpt?.include
    })
    for (const cpt of cpts) {
      await writeCptArtifacts(cpt, queryOutputPath)
      cptSpreads.push({ name: cpt.typeName, type: cpt.typeName })
    }
    if (cpts.length) {
      logger.debug(`Auto-generated fragments + queries for CPTs: ${cpts.map(c => c.typeName).join(', ')}`)
    }
  }

  // Detect conflicts between default and user queries
  const conflicts = findConflicts(userQueryPath, queryOutputPath)
  if (conflicts.length && wpNuxtConfig.queries.warnOnOverride) {
    logger.warn('The following user query files will override default queries:')
    for (const file of conflicts) {
      logger.warn(` - ${file}`)
    }
  }

  // Extend with user queries if they exist (only copy .gql/.graphql files)
  if (existsSync(userQueryPath)) {
    logger.debug('Extending queries:', userQueryPath)
    copyGraphqlFiles(userQueryPath, queryOutputPath)
  }

  // Auto-add custom content type fragments to NodeByUri query. The CPT
  // spreads are merged with any content-type fragments the user may have
  // added manually in extend/queries/fragments/.
  await addCustomFragmentsToNodeQuery(queryOutputPath, userQueryPath, logger, cptSpreads)

  logger.debug('Merged queries folder:', queryOutputPath)
  return queryOutputPath
}

/** Regex to extract fragment name and type condition from a .gql file */
const FRAGMENT_DEF_PATTERN = /fragment\s+(\w+)\s+on\s+(\w+)/

export interface ContentTypeFragment {
  name: string
  type: string
}

/**
 * Scans the user's extend/queries/fragments/ directory for custom content type
 * fragments and adds them to the NodeByUri query. This prevents "Fragment X is
 * never used" errors from WPGraphQL when nuxt-graphql-middleware bundles all
 * fragments into the query file.
 *
 * A fragment is considered a content type fragment when its name matches its
 * type condition (e.g., `fragment Event on Event`).
 *
 * @param queryOutputPath Merged queries folder where Node.gql lives.
 * @param userQueryPath User extend/queries folder scanned for content-type fragments.
 * @param logger Module logger.
 * @param preDiscovered Spreads already known from auto-generated CPT fragments.
 *   Merged with anything scanned from the user folder and deduplicated by type.
 */
export async function addCustomFragmentsToNodeQuery(
  queryOutputPath: string,
  userQueryPath: string,
  logger: ConsolaInstance,
  preDiscovered: ContentTypeFragment[] = []
): Promise<void> {
  const byType = new Map<string, ContentTypeFragment>()
  for (const f of preDiscovered) byType.set(f.type, f)

  const userFragmentsDir = join(userQueryPath, 'fragments')
  if (existsSync(userFragmentsDir)) {
    for (const file of readdirSync(userFragmentsDir)) {
      if (!file.endsWith('.gql') && !file.endsWith('.graphql')) continue

      const content = await fsp.readFile(join(userFragmentsDir, file), 'utf-8')
      const match = content.match(FRAGMENT_DEF_PATTERN)
      if (!match) continue

      const name = match[1]
      const type = match[2]
      // Content type fragments have name === type (e.g., fragment Event on Event)
      if (name && type && name === type) {
        byType.set(type, { name, type })
      }
    }
  }

  const customFragments = [...byType.values()]
  if (customFragments.length === 0) return

  // Add custom fragment spreads to Node.gql
  const nodeGqlPath = join(queryOutputPath, 'Node.gql')
  if (!existsSync(nodeGqlPath)) return

  let nodeGql = await fsp.readFile(nodeGqlPath, 'utf-8')

  const spreads = customFragments
    .map(f => `    ... on ${f.type} { ...${f.name} }`)
    .join('\n')

  // Insert before the closing braces
  nodeGql = nodeGql.replace(
    /(\s+\.\.\.Post)\n(\s+\}\n\})/,
    `$1\n${spreads}\n$2`
  )

  await fsp.writeFile(nodeGqlPath, nodeGql, 'utf-8')

  logger.debug(
    `Added custom content type fragments to NodeByUri: ${customFragments.map(f => f.name).join(', ')}`
  )
}

export function findConflicts(userQueryPath: string, outputPath: string): string[] {
  const conflicts: string[] = []
  function walk(dir: string) {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        walk(fullPath)
      } else if (stat.isFile()) {
        const rel = relative(userQueryPath, fullPath)
        const target = join(outputPath, rel)
        if (existsSync(target)) {
          conflicts.push(rel)
        }
      }
    }
  }
  if (existsSync(userQueryPath)) {
    walk(userQueryPath)
  }
  return conflicts
}

/**
 * Recursively copies only `.gql` and `.graphql` files from source to destination.
 * This prevents non-GraphQL files (like README.md) from reaching the merged
 * queries folder where they would cause parsing errors.
 */
function copyGraphqlFiles(src: string, dest: string): void {
  const entries = readdirSync(src)
  for (const entry of entries) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    const stat = statSync(srcPath)
    if (stat.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyGraphqlFiles(srcPath, destPath)
    } else if (entry.endsWith('.gql') || entry.endsWith('.graphql')) {
      cpSync(srcPath, destPath)
    }
  }
}
