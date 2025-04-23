import { existsSync, cpSync, promises as fsp } from 'node:fs'
import { createResolver, useLogger } from '@nuxt/kit'
import { ref } from 'vue'
import type { ConsolaInstance } from 'consola'
import type { WPNuxtConfig } from './types/config'

export function randHashGenerator(length = 12) {
  const randomChar = () => Math.floor(36 * Math.random()).toString(36)

  return Array<string>(length)
    .fill(String())
    .map(randomChar)
    .reduce((acc, cur) => {
      return acc + cur.toUpperCase()
    }, '')
}

const loggerRef = ref()

export const initLogger = (debug: boolean) => {
  loggerRef.value = useLogger('wpnuxt', { level: debug ? 4 : 3 })
  return loggerRef.value
}
export function getLogger(): ConsolaInstance {
  return loggerRef.value
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function mergeQueries(nuxt: any, wpNuxtConfig: WPNuxtConfig) {
  const { resolve } = createResolver(import.meta.url)
  const resolveRuntimeModule = (path: string) => resolve('./runtime', path)
  const logger = getLogger()

  const queryOutputPath = resolve((nuxt.options.srcDir || nuxt.options.rootDir) + '/' + wpNuxtConfig.queries.mergedOutputFolder)
  await fsp.rm(queryOutputPath, { recursive: true, force: true })

  const userQueryPath = resolve((nuxt.options.srcDir || nuxt.options.rootDir) + '/' + wpNuxtConfig.queries.extendFolder)
  logger.debug('User query path:', userQueryPath)
  /* const userQueryPath = wpNuxtConfig.queries.extendFolder
    .replace(/^(~~|@@)/, nuxt.options.rootDir)
    .replace(/^(~|@)/, nuxt.options.srcDir) */
  const userQueryPathExists = existsSync(userQueryPath)
  cpSync(resolveRuntimeModule('./queries/'), queryOutputPath, { recursive: true })

  if (userQueryPathExists) {
    logger.debug('Extending queries:', userQueryPath)
    cpSync(resolve(userQueryPath), queryOutputPath, { recursive: true })
  }
  logger.debug('Copied merged queries in folder:', queryOutputPath)
  return queryOutputPath
}
