import { parse } from 'graphql'
import type { SelectionNode, OperationDefinitionNode } from 'graphql'
import type { WPNuxtQuery } from './types'

/**
 * Parses a GraphQL document string and extracts query operations
 *
 * @param doc - The GraphQL document string to parse
 * @returns Array of parsed query operations with their metadata
 * @throws Error if an operation is missing a name
 */
const _parseDoc = async (doc: string): Promise<WPNuxtQuery[]> => {
  const { definitions } = parse(doc)

  const operations: WPNuxtQuery[] = definitions
    .filter(({ kind }) => kind === 'OperationDefinition')
    .map((definition) => {
      const operationDefinition = definition as OperationDefinitionNode
      if (!operationDefinition.name?.value) {
        throw new Error(`Operation name missing in: ${doc}`)
      }

      const query: WPNuxtQuery = {
        name: operationDefinition.name.value.trim(),
        nodes: [],
        fragments: [],
        params: {},
        operation: operationDefinition.operation
      }
      processSelections(operationDefinition.selectionSet.selections, 0, query)
      return query
    })
  return operations
}

/**
 * Recursively processes GraphQL selection sets to extract nodes and fragments
 *
 * @param selections - The GraphQL selection nodes to process
 * @param level - Current depth level in the selection tree
 * @param query - The query object to populate with extracted data
 */
function processSelections(selections: readonly SelectionNode[], level: number, query: WPNuxtQuery): void {
  if (!selections || selections.length === 0) return
  if (selections.length === 1 && selections[0]?.kind === 'Field') {
    query.nodes?.push(selections[0].name.value.trim())
  }
  selections.forEach((s) => {
    if (s.kind === 'FragmentSpread') {
      query.fragments?.push(s.name.value.trim())
    } else if (s.selectionSet?.selections) {
      processSelections(s.selectionSet.selections, level + 1, query)
    }
  })
}

export const parseDoc = _parseDoc
