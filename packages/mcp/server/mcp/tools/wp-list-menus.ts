import { executeGraphQL } from '../../utils/graphql'

const MENUS_QUERY = `
  query Menus {
    menus {
      nodes {
        id
        databaseId
        name
        slug
        locations
        menuItems {
          nodes {
            id
            label
            url
            path
            parentId
            order
          }
        }
      }
    }
  }
`

export default defineMcpTool({
  description: 'List all WordPress navigation menus with their items. Useful for understanding site navigation structure.',
  inputSchema: {
    // No input required
  },
  async handler() {
    const result = await executeGraphQL<{
      menus: {
        nodes: Array<{
          id: string
          databaseId: number
          name: string
          slug: string
          locations: string[]
          menuItems: {
            nodes: Array<{
              id: string
              label: string
              url: string
              path: string
              parentId?: string
              order: number
            }>
          }
        }>
      }
    }>(MENUS_QUERY)

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const menus = result.data?.menus.nodes.map((menu) => {
      // Build hierarchical menu structure
      const items = menu.menuItems.nodes
      const topLevel = items.filter(i => !i.parentId)
      const buildHierarchy = (parentId: string): typeof items => {
        return items
          .filter(i => i.parentId === parentId)
          .map(i => ({
            ...i,
            children: buildHierarchy(i.id)
          }))
      }

      return {
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        locations: menu.locations,
        items: topLevel.map(i => ({
          id: i.id,
          label: i.label,
          path: i.path || i.url,
          order: i.order,
          children: buildHierarchy(i.id)
        }))
      }
    })

    return jsonResult({
      count: menus?.length ?? 0,
      menus
    })
  }
})
