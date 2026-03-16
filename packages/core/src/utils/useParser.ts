import { parse, GraphQLError } from 'graphql'
import type { SelectionNode, OperationDefinitionNode } from 'graphql'
import type { WPNuxtQuery } from '../types/queries'
import { createModuleError } from './errors'

const _parseDoc = async (doc: string): Promise<WPNuxtQuery[]> => {
  if (!doc || typeof doc !== 'string' || doc.trim().length === 0) {
    throw createModuleError('core', 'Invalid GraphQL document - document is empty or not a string')
  }

  try {
    const { definitions } = parse(doc)

    const operations: WPNuxtQuery[] = definitions
      .filter(({ kind }) => kind === 'OperationDefinition')
      .map((definition) => {
        const operationDefinition = definition as OperationDefinitionNode
        if (!operationDefinition.name?.value) {
          throw createModuleError('core', 'GraphQL operation is missing a name. All queries and mutations must have a name.')
        }

        const name = operationDefinition.name.value.trim()

        // Validate operation name produces a valid JavaScript identifier
        // to prevent issues in the generated .mjs composable files
        if (!/^[a-z_$][\w$]*$/i.test(name)) {
          throw createModuleError('core', `Invalid GraphQL operation name "${name}". Operation names must be valid JavaScript identifiers (start with a letter, underscore, or $ and contain only letters, numbers, underscores, or $).`)
        }

        const query: WPNuxtQuery = {
          name,
          nodes: [],
          fragments: [],
          params: {},
          operation: operationDefinition.operation
        }
        processSelections(operationDefinition.selectionSet.selections, 0, query)
        return query
      })
    return operations
  } catch (error) {
    if (error instanceof GraphQLError) {
      throw createModuleError('core', `Failed to parse GraphQL document - ${error.message}`)
    }
    throw error
  }
}

function processSelections(selections: readonly SelectionNode[], level: number, query: WPNuxtQuery, canExtract: boolean = true) {
  if (!selections || selections.length === 0) return

  // Only build extraction path if we have a single field selection at each level
  // Multiple selections means we need the full response (e.g., previousPost + nextPost)
  const firstSelection = selections[0]
  const hasSingleField = selections.length === 1 && firstSelection?.kind === 'Field'

  if (hasSingleField && canExtract && firstSelection.kind === 'Field') {
    query.nodes?.push(firstSelection.name.value.trim())
  }

  // Detect if this level has both custom inline fields and fragment spreads.
  // Exclude __typename — it's a meta-field, not a custom field that needs its own type.
  const hasFragments = selections.some(s => s.kind === 'FragmentSpread')
  const hasCustomFields = selections.some(s => s.kind === 'Field' && s.name.value !== '__typename')
  if (hasFragments && hasCustomFields) {
    query.hasInlineFields = true
  }

  // Detect WPGraphQL connection pattern: pageInfo + nodes as sibling fields
  const fieldNames = selections.filter(s => s.kind === 'Field').map(s => s.name.value)
  if (fieldNames.includes('pageInfo') && fieldNames.includes('nodes')) {
    query.hasPageInfo = true
  }

  selections.forEach((s) => {
    if (s.kind === 'FragmentSpread') {
      query.fragments?.push(s.name.value.trim())
    } else if (s.selectionSet?.selections) {
      // Stop extracting path if we had multiple selections at this level
      processSelections(s.selectionSet.selections, level + 1, query, canExtract && hasSingleField)
    }
  })
}

export const parseDoc = _parseDoc
