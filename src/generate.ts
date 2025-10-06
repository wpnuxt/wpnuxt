import { statSync, promises as fsp } from 'node:fs'
import { resolveFiles } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import { upperFirst } from 'scule'
import type { Import } from 'unimport'
import type { WPNuxtContext, WPNuxtQuery } from './types/queries'
import { getLogger } from './utils/index'
import { parseDoc } from './utils/useParser'

// Cache regex for performance
const SCHEMA_PATTERN = /schema\.(?:gql|graphql)$/i

const allowDocument = (f: string, resolver: Resolver) => {
  // Skip if filename contains 'schema'
  if (SCHEMA_PATTERN.test(f)) return false

  try {
    // Check if file has content
    return statSync(resolver.resolve(f)).size > 0
  } catch {
    // File doesn't exist or can't be read
    return false
  }
}
export async function generateWPNuxtComposables(ctx: WPNuxtContext, queryOutputPath: string, resolver: Resolver) {
  const gqlMatch = '**/*.{gql,graphql}'
  const documents: string[] = []
  const files = (await resolveFiles(queryOutputPath, [gqlMatch, '!**/schemas'], { followSymbolicLinks: false })).filter(doc => allowDocument(doc, resolver))
  documents.push(...files)
  ctx.docs = documents

  await prepareContext(ctx)
}

export async function prepareContext(ctx: WPNuxtContext) {
  const logger = getLogger()
  if (ctx.docs) {
    await prepareFunctions(ctx)
  }

  const fnName = (fn: string) => ctx.composablesPrefix + upperFirst(fn)

  // Helper to format node array
  const formatNodes = (nodes?: string[]) => nodes?.map(n => `'${n}'`).join(',') ?? ''

  // Helper to get fragment type string
  const getFragmentType = (q: WPNuxtQuery) => {
    const fragmentSuffix = q.fragments?.length && q.nodes?.includes('nodes') ? '[]' : ''
    return q.fragments?.length ? q.fragments.map(f => `${f}Fragment${fragmentSuffix}`).join(' | ') : 'any'
  }

  const fnExp = (q: WPNuxtQuery, typed = false, lazy = false) => {
    const baseName = fnName(q.name)
    const functionName = lazy ? `useLazy${q.name}` : baseName

    if (!typed) {
      if (lazy) {
        // Lazy variant passes lazy: true option
        return `export const ${functionName} = (params, options) => useWPContent('${q.name}', [${formatNodes(q.nodes)}], false, params, { ...options, lazy: true })`
      }
      return `export const ${functionName} = (params, options) => useWPContent('${q.name}', [${formatNodes(q.nodes)}], false, params, options)`
    }
    return `  export const ${functionName}: (params?: ${q.name}QueryVariables, options?: WPContentOptions) => WPContentResult<${getFragmentType(q)}>`
  }

  ctx.generateImports = () => [
    // Generate both regular and lazy variants for each function
    ...ctx.fns.flatMap(f => [
      fnExp(f, false, false), // Regular version
      fnExp(f, false, true) // Lazy version
    ])
  ].join('\n')

  // Use Set directly for better performance
  const typeSet = new Set<string>()
  ctx.fns.forEach((o) => {
    typeSet.add(`${o.name}QueryVariables`)
    o.fragments?.forEach(f => typeSet.add(`${f}Fragment`))
  })

  ctx.generateDeclarations = () => {
    const declarations = [
      `import type { ${[...typeSet].join(', ')} } from '#build/graphql-operations'`,
      'import type { ComputedRef, Ref } from \'vue\'',
      'import type { AsyncDataRequestStatus } from \'#app\'',
      '',
      'export interface WPContentOptions {',
      '  /** Whether to resolve the async function after loading the route, instead of blocking client-side navigation. Default: false */',
      '  lazy?: boolean',
      '  /** Whether to fetch data on the server (during SSR). Default: true */',
      '  server?: boolean',
      '  /** Whether to fetch immediately. Default: true */',
      '  immediate?: boolean',
      '  /** Watch reactive sources to auto-refresh */',
      '  watch?: unknown[]',
      '  /** Transform function to alter the result */',
      '  transform?: (input: unknown) => unknown',
      '  /** Additional options to pass to useAsyncGraphqlQuery */',
      '  [key: string]: unknown',
      '}',
      '',
      'interface WPContentResult<T> {',
      '  data: ComputedRef<T | undefined>',
      '  pending: Ref<boolean>',
      '  refresh: () => Promise<void>',
      '  execute: () => Promise<void>',
      '  clear: () => void',
      '  error: Ref<Error | undefined>',
      '  status: Ref<AsyncDataRequestStatus>',
      '}',
      '',
      'declare module \'#wpnuxt\' {',
      ...ctx.fns!.flatMap(f => [
        fnExp(f, true, false), // Regular version type
        fnExp(f, true, true) // Lazy version type
      ]),
      '}'
    ]
    return declarations.join('\n')
  }

  ctx.fnImports = [
    // Auto-import both regular and lazy variants
    ...ctx.fns.flatMap((fn): Import[] => [
      { from: '#wpnuxt', name: fnName(fn.name) },
      { from: '#wpnuxt', name: `useLazy${fn.name}` }
    ])
  ]

  logger.debug('generated WPNuxt composables: ')
  ctx.fns.forEach((f) => {
    logger.debug(` ${fnName(f.name)}()`)
    logger.debug(` useLazy${f.name}()`)
  })
}

async function prepareFunctions(ctx: WPNuxtContext) {
  if (!ctx.docs) {
    getLogger().error('no GraphQL query documents were found!')
    return
  }

  // Parallel file reads for better performance
  const operations = await Promise.all(
    ctx.docs.map(async (doc) => {
      const content = await fsp.readFile(doc, 'utf8')
      return parseDoc(content)
    })
  )

  // Flatten and add to context
  operations.flat().forEach((query) => {
    ctx.fns.push(query)
  })
}
