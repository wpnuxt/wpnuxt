import { z } from 'zod'
import { executeGraphQL, INTROSPECTION_QUERY } from '../../utils/graphql'

export default defineMcpTool({
  description: 'Fetch and analyze the GraphQL schema from WordPress. Use this to understand what queries and types are available.',
  inputSchema: {
    includeDescriptions: z.boolean().optional().describe('Include field descriptions in output')
  },
  async handler({ includeDescriptions = true }) {
    const result = await executeGraphQL(INTROSPECTION_QUERY)

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const schema = result.data as {
      __schema: {
        types: Array<{
          name: string
          kind: string
          description?: string
          fields?: Array<{
            name: string
            description?: string
            type: { name?: string, kind: string }
          }>
        }>
        queryType: { name: string }
        mutationType?: { name: string }
      }
    }

    // Filter out internal types (starting with __)
    const types = schema.__schema.types
      .filter(t => !t.name.startsWith('__'))
      .map(t => ({
        name: t.name,
        kind: t.kind,
        description: includeDescriptions ? t.description : undefined,
        fieldCount: t.fields?.length
      }))

    // Group types by kind
    const grouped = {
      queryType: schema.__schema.queryType.name,
      mutationType: schema.__schema.mutationType?.name,
      objectTypes: types.filter(t => t.kind === 'OBJECT'),
      inputTypes: types.filter(t => t.kind === 'INPUT_OBJECT'),
      enumTypes: types.filter(t => t.kind === 'ENUM'),
      scalarTypes: types.filter(t => t.kind === 'SCALAR'),
      interfaceTypes: types.filter(t => t.kind === 'INTERFACE')
    }

    return jsonResult(grouped)
  }
})
