import { executeGraphQL, TAXONOMIES_QUERY } from '../../utils/graphql'

export default defineMcpTool({
  description: 'List all WordPress taxonomies (categories, tags, custom taxonomies). Returns taxonomy details including which content types they are connected to.',
  async handler() {
    const result = await executeGraphQL<{
      taxonomies: {
        nodes: Array<{
          name: string
          graphqlSingleName: string
          graphqlPluralName: string
          description?: string
          hierarchical: boolean
          showInGraphql: boolean
          connectedContentTypes: {
            nodes: Array<{ name: string }>
          }
        }>
      }
    }>(TAXONOMIES_QUERY)

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const taxonomies = result.data?.taxonomies.nodes.map(tax => ({
      name: tax.name,
      graphqlSingle: tax.graphqlSingleName,
      graphqlPlural: tax.graphqlPluralName,
      description: tax.description,
      hierarchical: tax.hierarchical,
      connectedTo: tax.connectedContentTypes.nodes.map(ct => ct.name)
    }))

    return jsonResult({
      count: taxonomies?.length ?? 0,
      taxonomies
    })
  }
})
