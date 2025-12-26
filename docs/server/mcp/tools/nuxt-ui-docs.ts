import { z } from 'zod'
import { callNuxtUITool, listNuxtUITools } from '../../utils/nuxt-ui-mcp'

/**
 * Proxy tool for accessing Nuxt UI documentation through WPNuxt MCP
 * This allows users to only configure WPNuxt MCP while still accessing Nuxt UI docs
 */
export default defineMcpTool({
  description: `Access Nuxt UI component library documentation directly through WPNuxt MCP.

This tool proxies requests to the official Nuxt UI MCP server (https://ui.nuxt.com/mcp), allowing you to:
- Get component documentation (props, slots, events)
- Learn about theming and styling
- Access installation and setup guides

Common operations:
- Get component info: action="get-component", componentName="Button"
- List all components: action="list-components"
- Get installation guide: action="get-installation"`,
  inputSchema: {
    action: z.enum(['get-component', 'list-components', 'get-installation', 'list-tools']).describe('Action to perform'),
    componentName: z.string().optional().describe('Component name in PascalCase (for get-component action)')
  },
  async handler({ action, componentName }) {
    try {
      switch (action) {
        case 'get-component': {
          if (!componentName) {
            return textResult('Error: componentName is required for get-component action')
          }
          const component = await callNuxtUITool('get-component', { componentName })
          if (!component) {
            return textResult(`Could not fetch component: ${componentName}`)
          }
          return jsonResult(component)
        }

        case 'list-components': {
          const components = await callNuxtUITool('list-components')
          if (!components) {
            return textResult('Could not fetch component list')
          }
          return jsonResult(components)
        }

        case 'get-installation': {
          const installation = await callNuxtUITool('get-documentation-page', {
            path: '/docs/getting-started/installation'
          })
          if (!installation) {
            return textResult('Could not fetch installation guide')
          }
          return jsonResult(installation)
        }

        case 'list-tools': {
          const tools = await listNuxtUITools()
          return jsonResult({
            description: 'Available tools from Nuxt UI MCP server',
            tools
          })
        }

        default:
          return textResult(`Unknown action: ${action}`)
      }
    } catch (error) {
      return textResult(`Error accessing Nuxt UI documentation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
})
