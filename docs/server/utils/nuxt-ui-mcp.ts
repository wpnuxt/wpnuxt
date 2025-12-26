/**
 * MCP Client for connecting to Nuxt UI MCP server
 * Provides access to Nuxt UI documentation, components, and setup guides
 *
 * Note: SDK is lazy-loaded to prevent keeping Node.js process alive during build
 */

import type { Client } from '@modelcontextprotocol/sdk/client/index.js'

const NUXT_UI_MCP_URL = 'https://ui.nuxt.com/mcp'

export interface NuxtUIComponent {
  name: string
  description?: string
  props?: Record<string, unknown>
  slots?: Record<string, unknown>
}

export interface NuxtUISetupInfo {
  dependencies: string[]
  cssImports: string[]
  nuxtConfig: Record<string, unknown>
  files: Array<{ path: string, content: string }>
}

let clientInstance: Client | null = null
let connectionPromise: Promise<Client> | null = null

/**
 * Get or create a connected MCP client for Nuxt UI
 * SDK is lazy-loaded to avoid keeping Node.js alive during build
 */
async function getClient(): Promise<Client> {
  if (clientInstance) {
    return clientInstance
  }

  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = (async () => {
    // Lazy-load SDK to prevent build from hanging
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js')
    const { StreamableHTTPClientTransport } = await import('@modelcontextprotocol/sdk/client/streamableHttp.js')

    const transport = new StreamableHTTPClientTransport(
      new URL(NUXT_UI_MCP_URL)
    )

    const client = new Client({
      name: 'wpnuxt-mcp',
      version: '2.0.0'
    })

    await client.connect(transport)
    clientInstance = client
    return client
  })()

  return connectionPromise
}

/**
 * List all available tools from the Nuxt UI MCP server
 */
export async function listNuxtUITools(): Promise<Array<{ name: string, description?: string }>> {
  try {
    const client = await getClient()
    const result = await client.listTools()
    return result.tools.map(tool => ({
      name: tool.name,
      description: tool.description
    }))
  } catch (error) {
    console.error('Failed to list Nuxt UI tools:', error)
    return []
  }
}

/**
 * Call a tool on the Nuxt UI MCP server
 */
export async function callNuxtUITool<T = unknown>(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<T | null> {
  try {
    const client = await getClient()
    const result = await client.callTool({
      name: toolName,
      arguments: args
    })

    // Parse the result content
    if (result.content && Array.isArray(result.content)) {
      const textContent = result.content.find(c => c.type === 'text')
      if (textContent && 'text' in textContent) {
        try {
          return JSON.parse(textContent.text) as T
        } catch {
          return textContent.text as T
        }
      }
    }
    return result as T
  } catch (error) {
    console.error(`Failed to call Nuxt UI tool ${toolName}:`, error)
    return null
  }
}

/**
 * Get Nuxt UI setup/installation information
 */
export async function getNuxtUISetupInfo(): Promise<NuxtUISetupInfo | null> {
  // Try to get setup documentation from the MCP server
  const result = await callNuxtUITool<string>('get_doc', {
    path: 'getting-started/installation'
  })

  if (!result) {
    // Return default setup info if MCP call fails
    return getDefaultNuxtUISetup()
  }

  // Parse the documentation to extract setup info
  return parseSetupFromDocs(result)
}

/**
 * Get CSS setup information specifically
 */
export async function getNuxtUICSSSetup(): Promise<{ cssFile: string, imports: string[] } | null> {
  const setupInfo = await getNuxtUISetupInfo()

  if (setupInfo) {
    const cssFile = setupInfo.files.find(f => f.path.includes('main.css') || f.path.includes('app.css'))
    if (cssFile) {
      return {
        cssFile: cssFile.path,
        imports: setupInfo.cssImports
      }
    }
  }

  // Default CSS setup for Nuxt UI v3
  return {
    cssFile: 'app/assets/css/main.css',
    imports: [
      '@import "tailwindcss";',
      '@import "@nuxt/ui";'
    ]
  }
}

/**
 * Get component information from Nuxt UI
 */
export async function getNuxtUIComponent(componentName: string): Promise<NuxtUIComponent | null> {
  return callNuxtUITool<NuxtUIComponent>('get_component', {
    name: componentName
  })
}

/**
 * Search for components in Nuxt UI
 */
export async function searchNuxtUIComponents(query: string): Promise<NuxtUIComponent[]> {
  const result = await callNuxtUITool<{ components: NuxtUIComponent[] }>('search_components', {
    query
  })
  return result?.components ?? []
}

/**
 * Parse setup information from documentation text
 */
function parseSetupFromDocs(docs: string): NuxtUISetupInfo {
  const setup: NuxtUISetupInfo = {
    dependencies: ['@nuxt/ui'],
    cssImports: ['@import "tailwindcss";', '@import "@nuxt/ui";'],
    nuxtConfig: {},
    files: []
  }

  // Look for CSS imports in the docs
  const cssImportMatch = docs.match(/@import\s+["'][^"']+["'];?/g)
  if (cssImportMatch) {
    setup.cssImports = cssImportMatch
  }

  // Look for file paths
  if (docs.includes('main.css') || docs.includes('app/assets/css')) {
    setup.files.push({
      path: 'app/assets/css/main.css',
      content: setup.cssImports.join('\n')
    })
  }

  return setup
}

/**
 * Default Nuxt UI setup when MCP server is unavailable
 */
function getDefaultNuxtUISetup(): NuxtUISetupInfo {
  return {
    dependencies: ['@nuxt/ui'],
    cssImports: [
      '@import "tailwindcss";',
      '@import "@nuxt/ui";'
    ],
    nuxtConfig: {
      modules: ['@nuxt/ui']
    },
    files: [
      {
        path: 'app/assets/css/main.css',
        content: '@import "tailwindcss";\n@import "@nuxt/ui";'
      }
    ]
  }
}

/**
 * Close the MCP client connection
 */
export async function closeNuxtUIClient(): Promise<void> {
  if (clientInstance) {
    await clientInstance.close()
    clientInstance = null
    connectionPromise = null
  }
}
