import { statSync, promises as fsp } from 'node:fs'
import { resolveFiles } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import { upperFirst } from 'scule'
import type { Import } from 'unimport'
import type { WPNuxtContext, WPNuxtQuery } from './types/queries'
import { getLogger } from './utils/index'
import { parseDoc } from './utils/useParser'

// Cache regex for performance
const SCHEMA_PATTERN = /schema\.(gql|graphql)$/i

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

  const fnExp = (q: WPNuxtQuery, typed = false) => {
    const functionName = fnName(q.name)
    if (!typed) {
      return `export const ${functionName} = (params) => useWPContent('${q.name}', [${formatNodes(q.nodes)}], false, params)`
    }
    return `  export const ${functionName}: (params?: ${q.name}QueryVariables) => GraphqlResponse<${getFragmentType(q)}>`
  }

  const fnExpAsync = (q: WPNuxtQuery, typed = false) => {
    const functionName = fnName('Async' + q.name)
    if (!typed) {
      return `export const ${functionName} = (params) => useAsyncWPContent('${q.name}', [${formatNodes(q.nodes)}], false, params)`
    }
    return `  export const ${functionName}: (params?: ${q.name}QueryVariables) => AsyncData<${getFragmentType(q)}, FetchError | null | undefined>`
  }

  ctx.generateImports = () => [
    ...ctx.fns.map(f => fnExp(f)),
    ...ctx.fns.map(f => fnExpAsync(f))
  ].join('\n')

  // Use Set directly for better performance
  const typeSet = new Set<string>()
  ctx.fns.forEach(o => {
    typeSet.add(`${o.name}QueryVariables`)
    o.fragments?.forEach(f => typeSet.add(`${f}Fragment`))
  })

  ctx.generateDeclarations = () => {
    const declarations = [
      `import type { ${[...typeSet].join(', ')} } from '#build/graphql-operations'`,
      'import { AsyncData } from \'nuxt/app\'',
      'import { FetchError } from \'ofetch\'',
      'declare module \'#wpnuxt\' {',
      ...ctx.fns!.map(f => fnExp(f, true)),
      ...ctx.fns!.map(f => fnExpAsync(f, true)),
      '}'
    ]
    return declarations.join('\n')
  }

  ctx.fnImports = [
    ...ctx.fns.map((fn): Import => ({ from: '#wpnuxt', name: fnName(fn.name) })),
    ...ctx.fns.map((fn): Import => ({ from: '#wpnuxt', name: fnName('Async' + fn.name) }))
  ]

  logger.debug('generated WPNuxt composables: ')
  ctx.fns.forEach(f => logger.debug(` ${fnName(f.name)}()`))
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
