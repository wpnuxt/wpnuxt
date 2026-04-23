import { existsSync, readFileSync } from 'node:fs'
import { parse } from 'graphql'
import type {
  DocumentNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeNode
} from 'graphql'

/**
 * Information about a Custom Post Type discovered in the WPGraphQL schema,
 * enough to auto-generate a base fragment and the standard list/byUri/bySlug
 * queries for it.
 */
export interface DiscoveredCpt {
  /** GraphQL object type name, e.g. `Event`. */
  typeName: string
  /** RootQuery field for single-item fetch, e.g. `event`. */
  singleField: string
  /** RootQuery field for the connection, e.g. `events`. */
  connectionField: string
  /** Name of the `*IdType` enum used by `singleField`, e.g. `EventIdType`. */
  idTypeEnum?: string
  /** IdType enum values the CPT supports (e.g. `URI`, `SLUG`, `DATABASE_ID`). */
  supportedIdTypes: Set<string>
  /** The set of GraphQL interfaces the type implements (e.g. `ContentNode`, `NodeWithTitle`). */
  interfaces: Set<string>
  /** Whether the type declares specific scalar fields directly (title, slug, etc.). */
  hasField: Record<string, boolean>
}

export interface CptDiscoveryOptions {
  /** Type names to exclude (in addition to the built-in exclusions). */
  exclude?: string[]
  /** If set, only these type names will be returned. */
  include?: string[]
}

/**
 * Built-in WPGraphQL types that implement `ContentNode` but already have
 * default WPNuxt fragments/queries or are not user-facing CPTs.
 */
export const DEFAULT_CPT_EXCLUSIONS: readonly string[] = [
  'Post',
  'Page',
  'MediaItem',
  'Revision',
  'Comment',
  'ActionMonitorAction'
]

/**
 * Parse the WPGraphQL schema at `schemaPath` and return every Custom Post
 * Type that should receive auto-generated fragments and queries.
 *
 * Returns `[]` if the schema file does not exist (first-ever build) or is
 * malformed — the caller treats this as "no CPTs to generate" rather than
 * an error, so a missing schema does not block module setup.
 */
export function discoverCpts(schemaPath: string, options: CptDiscoveryOptions = {}): DiscoveredCpt[] {
  if (!existsSync(schemaPath)) return []

  let ast: DocumentNode
  try {
    ast = parse(readFileSync(schemaPath, 'utf8'), { noLocation: true })
  } catch {
    return []
  }

  const typesByName = new Map<string, ObjectTypeDefinitionNode>()
  const enumsByName = new Map<string, EnumTypeDefinitionNode>()
  for (const def of ast.definitions) {
    if (def.kind === 'ObjectTypeDefinition') typesByName.set(def.name.value, def)
    else if (def.kind === 'EnumTypeDefinition') enumsByName.set(def.name.value, def)
  }

  const rootQuery = typesByName.get('RootQuery')
  if (!rootQuery?.fields) return []

  // Map type name → its single-fetch and connection fields on RootQuery.
  // - Single: field returns the type directly AND has an `idType` argument.
  // - Connection: field returns `RootQueryTo${TypeName}Connection` AND has cursor args.
  const fieldsByType = new Map<string, { single?: string, connection?: string, idTypeEnum?: string }>()
  for (const field of rootQuery.fields) {
    const returnType = unwrapNamedType(field.type)
    if (!returnType) continue

    const hasIdType = field.arguments?.some(a => a.name.value === 'idType')
    if (typesByName.has(returnType) && hasIdType) {
      const idTypeArg = field.arguments?.find(a => a.name.value === 'idType')
      const idTypeEnum = idTypeArg ? unwrapNamedType(idTypeArg.type) : undefined
      const entry = fieldsByType.get(returnType) ?? {}
      entry.single = field.name.value
      entry.idTypeEnum = idTypeEnum
      fieldsByType.set(returnType, entry)
      continue
    }

    const connMatch = /^RootQueryTo(\w+)Connection$/.exec(returnType)
    const hasCursorArgs = field.arguments?.some(a => a.name.value === 'first')
      && field.arguments?.some(a => a.name.value === 'after')
    if (connMatch && hasCursorArgs) {
      const typeName = connMatch[1]!
      const entry = fieldsByType.get(typeName) ?? {}
      entry.connection = field.name.value
      fieldsByType.set(typeName, entry)
    }
  }

  const excludeSet = new Set<string>([...DEFAULT_CPT_EXCLUSIONS, ...(options.exclude ?? [])])
  const includeSet = options.include?.length ? new Set(options.include) : undefined

  const result: DiscoveredCpt[] = []
  for (const [typeName, node] of typesByName) {
    if (!typeImplements(node, 'ContentNode')) continue
    if (excludeSet.has(typeName)) continue
    if (includeSet && !includeSet.has(typeName)) continue

    const queryFields = fieldsByType.get(typeName)
    if (!queryFields?.single || !queryFields.connection) continue

    const supportedIdTypes = new Set<string>()
    if (queryFields.idTypeEnum) {
      const enumDef = enumsByName.get(queryFields.idTypeEnum)
      enumDef?.values?.forEach(v => supportedIdTypes.add(v.name.value))
    }

    result.push({
      typeName,
      singleField: queryFields.single,
      connectionField: queryFields.connection,
      idTypeEnum: queryFields.idTypeEnum,
      supportedIdTypes,
      interfaces: new Set((node.interfaces ?? []).map(i => i.name.value)),
      hasField: collectScalarFieldFlags(node, ['title', 'slug', 'uri', 'date'])
    })
  }

  return result.sort((a, b) => a.typeName.localeCompare(b.typeName))
}

function unwrapNamedType(type: TypeNode): string | undefined {
  let current: TypeNode | undefined = type
  while (current) {
    if (current.kind === 'NamedType') return current.name.value
    current = (current as { type?: TypeNode }).type
  }
  return undefined
}

function typeImplements(node: ObjectTypeDefinitionNode, interfaceName: string): boolean {
  return node.interfaces?.some(i => i.name.value === interfaceName) ?? false
}

function collectScalarFieldFlags(node: ObjectTypeDefinitionNode, fieldNames: string[]): Record<string, boolean> {
  const flags: Record<string, boolean> = {}
  const declared = new Set<string>((node.fields ?? []).map((f: FieldDefinitionNode) => f.name.value))
  for (const name of fieldNames) flags[name] = declared.has(name)
  return flags
}
