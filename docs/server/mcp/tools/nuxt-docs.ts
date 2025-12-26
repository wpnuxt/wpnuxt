import { z } from 'zod'
import { callNuxtTool, listNuxtDocPages, getNuxtGettingStarted } from '../../utils/nuxt-mcp'

/**
 * Proxy tool for accessing Nuxt documentation through WPNuxt MCP
 * This allows users to only configure WPNuxt MCP while still accessing Nuxt docs
 */
export default defineMcpTool({
  description: `Access Nuxt framework documentation directly through WPNuxt MCP.

This tool proxies requests to the official Nuxt MCP server (https://nuxt.com/mcp), allowing you to:
- Get documentation pages about Nuxt 4 features
- Learn about composables, data fetching, and SSR
- Understand directory structure and configuration

Common documentation paths:
- /docs/4.x/getting-started/introduction
- /docs/4.x/getting-started/installation
- /docs/4.x/guide/directory-structure/composables
- /docs/4.x/guide/concepts/rendering
- /docs/4.x/api/composables/use-async-data`,
  inputSchema: {
    action: z.enum(['get-page', 'list-pages', 'getting-started']).describe('Action to perform'),
    path: z.string().optional().describe('Documentation page path (for get-page action)'),
    version: z.enum(['3.x', '4.x', 'all']).optional().describe('Nuxt version (default: 4.x)')
  },
  async handler({ action, path, version = '4.x' }) {
    try {
      switch (action) {
        case 'get-page': {
          if (!path) {
            return textResult('Error: path is required for get-page action')
          }
          const page = await callNuxtTool<{ title: string, content: string }>('get-documentation-page', { path })
          if (!page) {
            return textResult(`Could not fetch documentation page: ${path}`)
          }
          return jsonResult({
            title: page.title,
            path,
            content: page.content
          })
        }

        case 'list-pages': {
          const pages = await listNuxtDocPages(version as '3.x' | '4.x' | 'all')
          return jsonResult({
            version,
            pageCount: pages.length,
            pages: pages.slice(0, 50) // Limit to first 50 for readability
          })
        }

        case 'getting-started': {
          const guide = await getNuxtGettingStarted(version as '3.x' | '4.x')
          if (!guide) {
            return textResult('Could not fetch getting started guide')
          }
          return textResult(guide)
        }

        default:
          return textResult(`Unknown action: ${action}`)
      }
    } catch (error) {
      return textResult(`Error accessing Nuxt documentation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
})
