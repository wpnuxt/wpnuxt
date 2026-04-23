import { statSync, promises as fsp } from 'node:fs'
import { resolveFiles } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import { upperFirst } from 'scule'
import type { Import } from 'unimport'
import type ts from 'typescript'
import type { WPNuxtContext, WPNuxtQuery } from './types/queries'
import { getLogger } from './utils/index'
import { parseDoc } from './utils/useParser'
import { arrayOf, indexedAccess, nonNullable, numberIndexedAccess, printType, typeRef, unionOrSingle, withImagePath } from './utils/typegen'

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

  /**
   * Build the TypeScript return type for a query as an AST node. Printed to a
   * string immediately below; the intermediate AST keeps the shape machine-
   * checkable so malformed output is a TypeScript error here rather than a
   * cryptic error downstream in user code.
   *
   * - Queries with fragments only: fragment types (e.g. `PostFragment[]`)
   * - Queries with inline fields or no fragments: root query type with path
   *   accessors (e.g. `NonNullable<PostsRootQuery>['posts']['nodes'][number]`)
   */
  const buildFragmentTypeNode = (q: WPNuxtQuery): ts.TypeNode => {
    if (q.hasPageInfo) {
      if (q.hasInlineFields || !q.fragments?.length) {
        if (q.nodes?.length) {
          let node: ts.TypeNode = typeRef(`${q.name}RootQuery`)
          for (const segment of q.nodes) {
            node = indexedAccess(nonNullable(node), segment)
          }
          // Drill into `.nodes[number]` to get the item type
          return numberIndexedAccess(indexedAccess(nonNullable(node), 'nodes'))
        }
        return typeRef(`${q.name}RootQuery`)
      }
      // Fragments only — singular type (WPConnectionResult<T> adds the array)
      return unionOrSingle(q.fragments.map(f => withImagePath(typeRef(`${f}Fragment`))))
    }

    if (q.hasInlineFields || !q.fragments?.length) {
      if (q.nodes?.length) {
        let node: ts.TypeNode = typeRef(`${q.name}RootQuery`)
        for (const segment of q.nodes) {
          node = indexedAccess(nonNullable(node), segment)
        }
        if (q.nodes.includes('nodes')) {
          node = numberIndexedAccess(node)
        }
        return node
      }
      return typeRef(`${q.name}RootQuery`)
    }

    const fragmentTypes = q.fragments.map(f => withImagePath(typeRef(`${f}Fragment`)))
    if (q.nodes?.includes('nodes')) {
      return unionOrSingle(fragmentTypes.map(arrayOf))
    }
    return unionOrSingle(fragmentTypes)
  }

  const getFragmentType = (q: WPNuxtQuery) => printType(buildFragmentTypeNode(q))

  // Query composable expression
  const queryFnExp = (q: WPNuxtQuery, typed = false) => {
    const functionName = fnName(q.name)

    if (q.hasPageInfo) {
      // Connection query — use useWPConnection
      if (!typed) {
        return `export const ${functionName} = (params, options) => useWPConnection('${q.name}', [${formatNodes(q.nodes)}], false, params, options)`
      }
      return `  export const ${functionName}: (params?: MaybeRefOrGetter<${q.name}QueryVariables>, options?: WPContentOptions) => WPConnectionResult<${getFragmentType(q)}>`
    }

    if (!typed) {
      return `export const ${functionName} = (params, options) => useWPContent('${q.name}', [${formatNodes(q.nodes)}], false, params, options)`
    }
    return `  export const ${functionName}: (params?: MaybeRefOrGetter<${q.name}QueryVariables>, options?: WPContentOptions) => WPContentResult<${getFragmentType(q)}>`
  }

  // Mutation composable expression
  const mutationFnExp = (m: WPNuxtQuery, typed = false) => {
    const functionName = mutationFnName(m.name)

    if (!typed) {
      return `export const ${functionName} = (variables, options) => wpMutation('${m.name}', variables, options)`
    }
    return `  export const ${functionName}: (variables: ${m.name}MutationVariables, options?: WPMutationOptions) => Promise<WPMutationResult<${m.name}Mutation>>`
  }

  ctx.generateImports = () => {
    const lines: string[] = []

    // Add explicit imports to ensure normalization code is included in the bundle
    // This is critical for SSG where auto-imports might not resolve correctly
    const imports: string[] = []
    const hasConnectionQueries = queries.some(q => q.hasPageInfo)
    const hasContentQueries = queries.some(q => !q.hasPageInfo)
    if (hasContentQueries) {
      imports.push('useWPContent')
    }
    if (hasConnectionQueries) {
      imports.push('useWPConnection')
    }
    if (imports.length > 0) {
      lines.push(`import { ${imports.join(', ')} } from '#imports'`)
    }
    // Mutations route through the internal client wrapper so future changes to
    // nuxt-graphql-middleware are absorbed in one file rather than every call site.
    if (mutations.length > 0) {
      lines.push(`import { wpMutation } from '#wpnuxt-internal'`)
    }
    if (lines.length > 0) {
      lines.push('')
    }

    // Generate query composables
    queries.forEach((f) => {
      lines.push(queryFnExp(f, false))
    })

    // Generate mutation composables
    mutations.forEach((m) => {
      lines.push(mutationFnExp(m, false))
    })

    return lines.join('\n')
  }

  // Collect types for queries and mutations
  const typeSet = new Set<string>()
  queries.forEach((o) => {
    typeSet.add(`${o.name}QueryVariables`)
    if (o.hasInlineFields || !o.fragments?.length) {
      // Query has inline fields alongside fragments, or no fragments — import root query type
      typeSet.add(`${o.name}RootQuery`)
    } else {
      // Query uses fragments only — import fragment types
      o.fragments.forEach(f => typeSet.add(`${f}Fragment`))
    }
  })
  mutations.forEach((m) => {
    typeSet.add(`${m.name}MutationVariables`)
    typeSet.add(`${m.name}Mutation`)
  })

  // Expose for post-generation schema-drift validation
  // (see utils/validateGenerated.ts, wired in module.ts)
  ctx.referencedTypes = [...typeSet]

  ctx.generateDeclarations = () => {
    const declarations = [
      `import type { ${[...typeSet].join(', ')} } from '#build/graphql-operations'`,
      'import type { ComputedRef, MaybeRefOrGetter, Ref } from \'vue\'',
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
      '  /** Enable client-side GraphQL caching. Default: true. Set to false for real-time data. */',
      '  clientCache?: boolean',
      '  /** Custom function to control when cached data should be used. */',
      '  getCachedData?: (key: string, nuxtApp: unknown, ctx: unknown) => unknown',
      '  /** Number of automatic retries on failure. Set to 0 or false to disable. Default: 0 (disabled) */',
      '  retry?: number | false',
      '  /** Base delay in milliseconds between retries (uses exponential backoff). Default: 1000 */',
      '  retryDelay?: number',
      '  /** Request timeout in milliseconds. Default: 0 (disabled). Set to e.g. 30000 for 30 seconds. */',
      '  timeout?: number',
      '  /** Additional options to pass to useAsyncData */',
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
      'interface WPConnectionResult<T> {',
      '  data: ComputedRef<T[] | undefined>',
      '  pageInfo: ComputedRef<WPPageInfo | undefined>',
      '  loadMore: () => Promise<void>',
      '  pending: Ref<boolean>',
      '  refresh: () => Promise<void>',
      '  execute: () => Promise<void>',
      '  clear: () => void',
      '  error: Ref<Error | undefined>',
      '  status: Ref<AsyncDataRequestStatus>',
      '}',
      '',
      'interface WPPageInfo {',
      '  hasNextPage: boolean',
      '  hasPreviousPage: boolean',
      '  startCursor?: string | null',
      '  endCursor?: string | null',
      '}',
      '',
      'type WPMutationResult<T> = GraphqlResponse<T>',
      '',
      '/** Adds relativePath to featuredImage.node when present (injected at runtime by transformData) */',
      'type WithImagePath<T> = T extends { featuredImage?: unknown }',
      '  ? T & { featuredImage?: { node: { relativePath?: string } } }',
      '  : T',
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
