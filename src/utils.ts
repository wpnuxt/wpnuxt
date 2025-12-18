import { existsSync, promises as fsp } from 'node:fs'
import { type LogLevel, createConsola, type ConsolaInstance } from 'consola'
import { hasNuxtModule, addTemplate, createResolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { join } from 'pathe'
import type { WPNuxtConfig } from './types'

interface InstalledModule {
  meta: {
    name: string
  }
  entryPath?: string
}

// Use plain variable instead of Vue ref to avoid reactivity overhead
let loggerInstance: ConsolaInstance | undefined

/**
 * Initializes the WPNuxt logger with specified log level
 *
 * @param logLevel - The logging level (0=silent, 1=error, 2=warn, 3=info, 4=debug, 5=trace)
 * @returns Configured Consola instance
 */
export const initLogger = (logLevel: LogLevel | undefined): ConsolaInstance => {
  if (!loggerInstance) {
    loggerInstance = createConsola({
      level: logLevel ?? 3,
      formatOptions: {
        colors: true,
        compact: true,
        date: true,
        fancy: true
      }
    }).withTag('wpnuxt')
  }
  return loggerInstance
}

/**
 * Gets the current logger instance
 *
 * @returns The logger instance if initialized, undefined otherwise
 */
export const getLogger = (): ConsolaInstance | undefined => {
  return loggerInstance
}

/**
 * Validates the WPNuxt module configuration
 *
 * @param options - The configuration options to validate
 * @throws Error if configuration is invalid
 */
export function validateConfig(options: Partial<WPNuxtConfig>): void {
  if (!options.wordpressUrl || options.wordpressUrl.length === 0) {
    throw new Error('WPNuxt error: WordPress url is missing')
  } else if (options.wordpressUrl.substring(options.wordpressUrl.length - 1) === '/') {
    throw new Error('WPNuxt error: WordPress url should not have a trailing slash: ' + options.wordpressUrl)
  }
  if (options.frontendUrl && options.frontendUrl.substring(options.frontendUrl.length - 1) === '/') {
    throw new Error('WPNuxt error: frontend url should not have a trailing slash: ' + options.frontendUrl)
  }
}

/**
 * Merges GraphQL queries from runtime, add-on modules, and user-defined directories
 *
 * @param nuxt - The Nuxt instance
 * @returns Path to the merged queries directory
 */
export async function mergeQueries(nuxt: Nuxt): Promise<string> {
  const { resolve } = createResolver(import.meta.url)
  const resolveRuntimeModule = (path: string) => resolve('./runtime', path)
  const logger = getLogger()

  const queryOutputPath = resolve((nuxt.options.srcDir || nuxt.options.rootDir) + '/.queries/')
  await fsp.rm(queryOutputPath, { recursive: true, force: true })

  const userQueryPath = '~/extend/queries/'
    .replace(/^(~~|@@)/, nuxt.options.rootDir)
    .replace(/^(~|@)/, nuxt.options.srcDir)
  const userQueryPathExists = existsSync(userQueryPath)
  const queryFiles = new Map<string, string>()

  // Copy and track runtime queries in one pass
  await copyAndTrack(resolveRuntimeModule('./queries/'), queryOutputPath, queryFiles, 'runtime')

  // Add queries from add-on modules
  const blocksPath = getAddOnModuleQueriesPath('@wpnuxt/blocks', nuxt)
  if (blocksPath) {
    logger?.debug('Loading queries from @wpnuxt/blocks')
    await copyAndTrack(blocksPath, queryOutputPath, queryFiles, '@wpnuxt/blocks')
  }

  const authPath = getAddOnModuleQueriesPath('@wpnuxt/auth', nuxt)
  if (authPath) {
    logger?.debug('Loading queries from @wpnuxt/auth')
    await copyAndTrack(authPath, queryOutputPath, queryFiles, '@wpnuxt/auth')
  }

  // Add user-defined queries
  if (userQueryPathExists) {
    logger?.debug('Extending queries:', userQueryPath)
    await copyAndTrack(resolve(userQueryPath), queryOutputPath, queryFiles, 'user')

    // Detect conflicts
    const conflicts = detectQueryConflicts(queryFiles)
    if (conflicts.length > 0) {
      logger?.warn('Query file conflicts detected:')
      conflicts.forEach((conflict) => {
        logger?.warn(`  - ${conflict.file} exists in multiple sources: ${conflict.sources.join(', ')}`)
      })
    }
  } else {
    // Create empty templates for modules that aren't installed
    if (!blocksPath) {
      const moduleName = 'wpnuxt/blocks'
      addTemplate({
        write: true,
        filename: moduleName + '.mjs',
        getContents: () => `export { }`
      })
      nuxt.options.alias['#' + moduleName] = resolve(nuxt.options.buildDir, moduleName)
    }
    if (!authPath) {
      const moduleName = 'wpnuxt/auth'
      addTemplate({
        write: true,
        filename: moduleName + '.mjs',
        getContents: () => `export { }`
      })
      nuxt.options.alias['#' + moduleName] = resolve(nuxt.options.buildDir, moduleName)
    }
  }

  logger?.debug('Copied merged queries in folder:', queryOutputPath)
  return queryOutputPath
}

/**
 * Optimized copy and track: copies files and tracks them in a single pass
 * This eliminates redundant file system reads
 */
async function copyAndTrack(
  sourcePath: string,
  destPath: string,
  fileMap: Map<string, string>,
  sourceLabel: string
): Promise<void> {
  try {
    const entries = await fsp.readdir(sourcePath, { withFileTypes: true })
    await fsp.mkdir(destPath, { recursive: true })

    // Process all files in parallel for better performance
    await Promise.all(
      entries.map(async (entry) => {
        const srcPath = join(sourcePath, entry.name)
        const destFilePath = join(destPath, entry.name)

        if (entry.isDirectory()) {
          await copyAndTrack(srcPath, destFilePath, fileMap, sourceLabel)
        } else if (entry.isFile() && (entry.name.endsWith('.gql') || entry.name.endsWith('.graphql'))) {
          await fsp.copyFile(srcPath, destFilePath)
          const existing = fileMap.get(entry.name)
          fileMap.set(entry.name, existing ? `${existing},${sourceLabel}` : sourceLabel)
        }
      })
    )
  } catch {
    // Source directory might not exist
  }
}

/**
 * Detects conflicts in GraphQL query files
 */
function detectQueryConflicts(fileMap: Map<string, string>): Array<{ file: string, sources: string[] }> {
  const conflicts: Array<{ file: string, sources: string[] }> = []
  fileMap.forEach((sources, file) => {
    const sourceList = sources.split(',')
    if (sourceList.length > 1) {
      conflicts.push({ file, sources: sourceList })
    }
  })
  return conflicts
}

/**
 * Gets the queries path for an add-on module if it's installed
 */
function getAddOnModuleQueriesPath(addOnModuleName: string, nuxt: Nuxt): string | null {
  if (!hasNuxtModule(addOnModuleName)) {
    return null
  }

  const installedModules = (nuxt.options as { _installedModules?: InstalledModule[] })._installedModules || []
  for (const m of installedModules) {
    if (m.meta.name === addOnModuleName && m.entryPath) {
      if (m.entryPath === '../src/module') {
        return join(nuxt.options.rootDir, '../src/runtime/queries/')
      } else if (m.entryPath.startsWith('../')) {
        return join(nuxt.options.rootDir, '../', m.entryPath, './runtime/queries/')
      } else {
        return join('./node_modules', m.entryPath, 'dist/runtime/queries/')
      }
    }
  }
  return null
}
