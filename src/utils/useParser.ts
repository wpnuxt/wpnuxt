import { parse, GraphQLError } from 'graphql'
import type { SelectionNode, OperationDefinitionNode } from 'graphql'
import type { WPNuxtQuery } from '../types/queries'

const _parseDoc = async (doc: string): Promise<WPNuxtQuery[]> => {
  if (!doc || typeof doc !== 'string' || doc.trim().length === 0) {
    throw new Error('WPNuxt: Invalid GraphQL document - document is empty or not a string')
  }

  try {
    const { definitions } = parse(doc)

    const operations: WPNuxtQuery[] = definitions
      .filter(({ kind }) => kind === 'OperationDefinition')
      .map((definition) => {
        const operationDefinition = definition as OperationDefinitionNode
        if (!operationDefinition.name?.value) {
          throw new Error('WPNuxt: GraphQL operation is missing a name. All queries and mutations must have a name.')
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
  } catch (error) {
    if (error instanceof GraphQLError) {
      throw new TypeError(`WPNuxt: Failed to parse GraphQL document - ${error.message}`)
    }
    throw error
  }
}

function processSelections(selections: readonly SelectionNode[], level: number, query: WPNuxtQuery) {
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
