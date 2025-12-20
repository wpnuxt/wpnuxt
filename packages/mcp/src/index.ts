import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

export async function createServer() {
  const server = new McpServer({
    name: 'wpnuxt-mcp',
    version: '2.0.0'
  })

  // TODO: Add tools for WordPress interaction
  // - fetch posts
  // - fetch pages
  // - search content
  // - get media

  return server
}

export async function startServer() {
  const server = await createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
