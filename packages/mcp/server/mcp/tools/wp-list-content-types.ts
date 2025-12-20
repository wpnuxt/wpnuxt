import { executeGraphQL, CONTENT_TYPES_QUERY } from '../../utils/graphql'

export default defineMcpTool({
  description: 'List all WordPress content types (post types). Returns both built-in types (posts, pages) and custom post types.',
  async handler() {
    const result = await executeGraphQL<{
      contentTypes: {
        nodes: Array<{
          name: string
          graphqlSingleName: string
          graphqlPluralName: string
          description?: string
          hasArchive: boolean
          hierarchical: boolean
        }>
      }
    }>(CONTENT_TYPES_QUERY)

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const contentTypes = result.data?.contentTypes.nodes.map(ct => ({
      name: ct.name,
      graphqlSingle: ct.graphqlSingleName,
      graphqlPlural: ct.graphqlPluralName,
      description: ct.description,
      hasArchive: ct.hasArchive,
      hierarchical: ct.hierarchical
    }))

    return jsonResult({
      count: contentTypes?.length ?? 0,
      contentTypes
    })
  }
})
