import { existsSync, cpSync, mkdirSync, promises as fsp, readdirSync, statSync } from 'node:fs'
import { rename, writeFile } from 'node:fs/promises'
import { relative, join } from 'node:path'
import { createResolver, useLogger } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { ConsolaInstance } from 'consola'
import type { Nuxt } from 'nuxt/schema'
import type { WPNuxtConfig } from '../types/config'

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

export async function mergeQueries(nuxt: Nuxt, wpNuxtConfig: WPNuxtConfig, resolver: Resolver) {
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

  logger.debug('Merged queries folder:', queryOutputPath)
  return queryOutputPath
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
