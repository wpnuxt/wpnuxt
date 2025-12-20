import { z } from 'zod'
import { executeGraphQL } from '../../utils/graphql'

export default defineMcpTool({
  description: 'Execute an arbitrary GraphQL query against WordPress. Use this for custom queries not covered by other tools.',
  inputSchema: {
    query: z.string().describe('The GraphQL query to execute'),
    variables: z.record(z.unknown()).optional().describe('Optional variables for the query')
  },
  async handler({ query, variables }) {
    // Basic validation
    if (!query.trim().startsWith('query') && !query.trim().startsWith('{')) {
      return textResult('Error: Query must start with "query" keyword or "{" for anonymous queries. Mutations are not supported for security reasons.')
    }

    // Block mutations for security
    if (query.toLowerCase().includes('mutation')) {
      return textResult('Error: Mutations are not allowed. This tool only supports read operations.')
    }

    const result = await executeGraphQL(query, variables)

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    return jsonResult(result.data)
  }
})
