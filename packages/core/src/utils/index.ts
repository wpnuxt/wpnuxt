import { existsSync, cpSync, promises as fsp } from 'node:fs'
import { createResolver, useLogger } from '@nuxt/kit'
import { ref } from 'vue'
import type { ConsolaInstance } from 'consola'
import type { Nuxt } from 'nuxt/schema'
import type { WPNuxtConfig } from '../types/config'

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

export async function mergeQueries(nuxt: Nuxt, wpNuxtConfig: WPNuxtConfig) {
  const { resolve } = createResolver(import.meta.url)
  const logger = getLogger()

  // Cache base directory
  const baseDir = nuxt.options.srcDir || nuxt.options.rootDir
  const queryOutputPath = resolve(baseDir, wpNuxtConfig.queries.mergedOutputFolder)
  const userQueryPath = resolve(baseDir, wpNuxtConfig.queries.extendFolder)
  const defaultQueriesPath = resolve('../runtime', 'queries')

  // Clean output directory
  await fsp.rm(queryOutputPath, { recursive: true, force: true })

  // Copy default queries
  cpSync(defaultQueriesPath, queryOutputPath, { recursive: true })

  // Extend with user queries if they exist
  if (existsSync(userQueryPath)) {
    logger.debug('Extending queries:', userQueryPath)
    cpSync(userQueryPath, queryOutputPath, { recursive: true })
  }

  logger.debug('Merged queries folder:', queryOutputPath)
  return queryOutputPath
}
