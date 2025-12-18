import { promises as fsp } from 'node:fs'
import { upperFirst } from 'scule'
import type { Import } from 'unimport'
import type { WPNuxtQuery } from './types'
import { getLogger } from './utils'
import { parseDoc } from './useParser'

export interface WPNuxtContext {
  composablesPrefix: string
  template?: string
  fns: WPNuxtQuery[]
  fnImports?: Import[]
  generateImports?: () => string
  generateDeclarations?: () => string
  docs?: string[]
}

/**
 * Prepares the WPNuxt context by generating composables from GraphQL documents
 *
 * @param ctx - The WPNuxt context object
 */
export async function prepareContext(ctx: WPNuxtContext): Promise<void> {
  const logger = getLogger()
  if (ctx.docs) {
    await prepareFunctions(ctx)
  }

  const fnName = (fn: string) => ctx.composablesPrefix + upperFirst(fn)
  const fnExp = (q: WPNuxtQuery, typed = false) => {
    const functionName = fnName(q.name)
    if (!typed) {
      return `export const ${functionName} = (params) => useWPContent('${q.operation}', '${q.name}', [${q.nodes?.map(n => `'${n}'`).join(',')}], false, params)`
    }
    const fragmentSuffix = q.fragments?.length && q.nodes?.includes('nodes') ? '[]' : ''
    const fragments = q.fragments?.length ? q.fragments.map(f => `${f}Fragment${fragmentSuffix}`).join(' | ') : 'any'
    return `  export const ${functionName}: (params?: ${q.name}QueryVariables) => AsyncData<${fragments}, FetchError | null | undefined>`
  }

  ctx.generateImports = () => {
    const parts: string[] = ['import { useWPContent } from \'#imports\'', '']
    for (const fn of ctx.fns) {
      parts.push(fnExp(fn))
    }
    return parts.join('\n')
  }

  const types: string[] = []
  for (const fn of ctx.fns) {
    types.push(...getQueryTypeTemplate(fn))
  }

  ctx.generateDeclarations = () => {
    const declarations: string[] = [
      `import type { ${[...new Set(types)].join(', ')} } from '#build/graphql-operations'`,
      'import { AsyncData } from \'nuxt/app\'',
      'import { FetchError } from \'ofetch\'',
      'declare module \'#wpnuxt\' {'
    ]

    for (const fn of ctx.fns) {
      declarations.push(fnExp(fn, true))
    }

    declarations.push('}')
    return declarations.join('\n')
  }

  ctx.fnImports = ctx.fns.map((fn): Import => ({ from: '#wpnuxt', name: fnName(fn.name) }))

  if (logger) {
    logger.debug('generated WPNuxt composables: ')
    for (const fn of ctx.fns) {
      logger.debug(` ${fnName(fn.name)}()`)
    }
  }
}

/**
 * Extracts TypeScript type names from a GraphQL query
 *
 * @param q - The GraphQL query object
 * @returns Array of type names to import
 */
function getQueryTypeTemplate(q: WPNuxtQuery): string[] {
  const types: string[] = [`${q.name}QueryVariables`]
  if (q.fragments && q.fragments.length > 0) {
    for (const fragment of q.fragments) {
      types.push(`${fragment}Fragment`)
    }
  }
  return types
}

/**
 * Parses GraphQL documents and populates the context with query functions
 * Processes all files in parallel for better performance
 *
 * @param ctx - The WPNuxt context object
 */
async function prepareFunctions(ctx: WPNuxtContext): Promise<void> {
  if (!ctx.docs) {
    getLogger()?.error('no GraphQL query documents were found!')
    return
  }

  // Process all GraphQL documents in parallel
  const allOperations = await Promise.all(
    ctx.docs.map(async (doc) => {
      const content = await fsp.readFile(doc, 'utf8')
      return parseDoc(content)
    })
  )

  // Flatten and add all operations to context
  ctx.fns.push(...allOperations.flat())
}
