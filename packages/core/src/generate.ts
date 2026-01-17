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

/**
 * Query complexity thresholds for warnings
 */
const COMPLEXITY_THRESHOLDS = {
  /** Maximum recommended extraction depth */
  maxDepth: 5,
  /** Maximum recommended number of fragments */
  maxFragments: 4
}

/**
 * Analyze query complexity and log warnings for potentially expensive queries.
 * This helps developers identify queries that might impact performance.
 */
function analyzeQueryComplexity(queries: WPNuxtQuery[]): void {
  const logger = getLogger()

  for (const query of queries) {
    const warnings: string[] = []

    // Check extraction depth
    const depth = query.nodes?.length ?? 0
    if (depth > COMPLEXITY_THRESHOLDS.maxDepth) {
      warnings.push(`deep extraction path (${depth} levels)`)
    }

    // Check number of fragments (may indicate complex data requirements)
    const fragmentCount = query.fragments?.length ?? 0
    if (fragmentCount > COMPLEXITY_THRESHOLDS.maxFragments) {
      warnings.push(`many fragments (${fragmentCount})`)
    }

    // Log warnings for potentially expensive queries
    if (warnings.length > 0) {
      logger.warn(
        `Query "${query.name}" may be expensive: ${warnings.join(', ')}. `
        + `Consider splitting into smaller queries or reducing data fetched.`
      )
    }
  }
}

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

  // Separate queries and mutations
  const queries = ctx.fns.filter(f => f.operation === 'query')
  const mutations = ctx.fns.filter(f => f.operation === 'mutation')

  // Analyze query complexity and warn about potentially expensive queries
  analyzeQueryComplexity(queries)

  const fnName = (fn: string) => ctx.composablesPrefix + upperFirst(fn)
  const mutationFnName = (fn: string) => `useMutation${upperFirst(fn)}`

  // Helper to format node array
  const formatNodes = (nodes?: string[]) => nodes?.map(n => `'${n}'`).join(',') ?? ''

  // Helper to get fragment type string
  const getFragmentType = (q: WPNuxtQuery) => {
    const fragmentSuffix = q.fragments?.length && q.nodes?.includes('nodes') ? '[]' : ''
    return q.fragments?.length ? q.fragments.map(f => `${f}Fragment${fragmentSuffix}`).join(' | ') : 'any'
  }

  // Query composable expression
  const queryFnExp = (q: WPNuxtQuery, typed = false) => {
    const functionName = fnName(q.name)

    if (!typed) {
      return `export const ${functionName} = (params, options) => useWPContent('${q.name}', [${formatNodes(q.nodes)}], false, params, options)`
    }
    return `  export const ${functionName}: (params?: ${q.name}QueryVariables, options?: WPContentOptions) => WPContentResult<${getFragmentType(q)}>`
  }

  // Mutation composable expression
  const mutationFnExp = (m: WPNuxtQuery, typed = false) => {
    const functionName = mutationFnName(m.name)

    if (!typed) {
      return `export const ${functionName} = (variables, options) => useGraphqlMutation('${m.name}', variables, options)`
    }
    return `  export const ${functionName}: (variables: ${m.name}MutationVariables, options?: WPMutationOptions) => Promise<WPMutationResult<${m.name}Mutation>>`
  }

  ctx.generateImports = () => {
    const imports: string[] = []

    // Generate query composables
    queries.forEach((f) => {
      imports.push(queryFnExp(f, false))
    })

    // Generate mutation composables
    mutations.forEach((m) => {
      imports.push(mutationFnExp(m, false))
    })

    return imports.join('\n')
  }

  // Collect types for queries and mutations
  const typeSet = new Set<string>()
  queries.forEach((o) => {
    typeSet.add(`${o.name}QueryVariables`)
    o.fragments?.forEach(f => typeSet.add(`${f}Fragment`))
  })
  mutations.forEach((m) => {
    typeSet.add(`${m.name}MutationVariables`)
    typeSet.add(`${m.name}Mutation`)
  })

  ctx.generateDeclarations = () => {
    const declarations = [
      `import type { ${[...typeSet].join(', ')} } from '#build/graphql-operations'`,
      'import type { ComputedRef, Ref } from \'vue\'',
      'import type { AsyncDataRequestStatus } from \'#app\'',
      'import type { GraphqlResponse } from \'nuxt-graphql-middleware/types\'',
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
      'export interface WPMutationOptions {',
      '  /** Fetch options to pass to the request */',
      '  fetchOptions?: RequestInit',
      '  /** Additional options */',
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
      'type WPMutationResult<T> = GraphqlResponse<T>',
      '',
      'declare module \'#wpnuxt\' {'
    ]

    // Add query type declarations
    queries.forEach((f) => {
      declarations.push(queryFnExp(f, true))
    })

    // Add mutation type declarations
    mutations.forEach((m) => {
      declarations.push(mutationFnExp(m, true))
    })

    declarations.push('}')
    return declarations.join('\n')
  }

  ctx.fnImports = [
    // Auto-import query composables
    ...queries.map((fn): Import => ({ from: '#wpnuxt', name: fnName(fn.name) })),
    // Auto-import mutation composables
    ...mutations.map((m): Import => ({ from: '#wpnuxt', name: mutationFnName(m.name) }))
  ]

  logger.debug('generated WPNuxt composables: ')
  queries.forEach((f) => {
    logger.debug(` ${fnName(f.name)}()`)
  })
  mutations.forEach((m) => {
    logger.debug(` ${mutationFnName(m.name)}()`)
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
