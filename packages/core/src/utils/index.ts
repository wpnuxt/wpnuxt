import { existsSync, cpSync, promises as fsp, readdirSync, statSync } from 'node:fs'
import { relative, join } from 'node:path'
import { createResolver, useLogger } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import { ref } from 'vue'
import type { ConsolaInstance } from 'consola'
import type { Nuxt } from 'nuxt/schema'
import type { WPNuxtConfig } from '../types/config'

// Re-export error utilities
export { createModuleError, formatErrorMessage, type WPNuxtModule } from './errors'

export function randHashGenerator(length = 12) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase()
    .padEnd(length, '0')
}

const loggerRef = ref()

export const initLogger = (debug: boolean) => {
  loggerRef.value = useLogger('wpnuxt', { level: debug ? 4 : 3 })
  return loggerRef.value
}
export function getLogger(): ConsolaInstance {
  return loggerRef.value
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

  // Extend with user queries if they exist
  if (existsSync(userQueryPath)) {
    logger.debug('Extending queries:', userQueryPath)
    cpSync(userQueryPath, queryOutputPath, { recursive: true })
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
