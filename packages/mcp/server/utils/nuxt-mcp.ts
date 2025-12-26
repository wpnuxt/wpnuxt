/**
 * MCP Client for connecting to Nuxt MCP server
 * Provides access to Nuxt framework documentation, modules, and guides
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const NUXT_MCP_URL = 'https://nuxt.com/mcp'

export interface NuxtDocPage {
  title: string
  description?: string
  content: string
  path: string
}

export interface NuxtModule {
  name: string
  slug: string
  description: string
  repo?: string
  npm?: string
  stats?: {
    downloads: number
    stars: number
  }
}

let clientInstance: Client | null = null
let connectionPromise: Promise<Client> | null = null

/**
 * Get or create a connected MCP client for Nuxt
 */
async function getClient(): Promise<Client> {
  if (clientInstance) {
    return clientInstance
  }

  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = (async () => {
    const transport = new StreamableHTTPClientTransport(
      new URL(NUXT_MCP_URL)
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
 * List all available tools from the Nuxt MCP server
 */
export async function listNuxtTools(): Promise<Array<{ name: string, description?: string }>> {
  try {
    const client = await getClient()
    const result = await client.listTools()
    return result.tools.map(tool => ({
      name: tool.name,
      description: tool.description
    }))
  } catch (error) {
    console.error('Failed to list Nuxt tools:', error)
    return []
  }
}

/**
 * Call a tool on the Nuxt MCP server
 */
export async function callNuxtTool<T = unknown>(
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
    console.error(`Failed to call Nuxt tool ${toolName}:`, error)
    return null
  }
}

/**
 * Get Nuxt documentation page
 */
export async function getNuxtDocPage(path: string): Promise<NuxtDocPage | null> {
  return callNuxtTool<NuxtDocPage>('get-documentation-page', { path })
}

/**
 * List all Nuxt documentation pages
 */
export async function listNuxtDocPages(version: '3.x' | '4.x' | 'all' = '4.x'): Promise<Array<{ title: string, path: string }>> {
  const result = await callNuxtTool<Array<{ title: string, path: string }>>('list-documentation-pages', { version })
  return result ?? []
}

/**
 * Get Nuxt getting started guide
 */
export async function getNuxtGettingStarted(version: '3.x' | '4.x' = '4.x'): Promise<string | null> {
  return callNuxtTool<string>('get-getting-started-guide', { version })
}

/**
 * List Nuxt modules
 */
export async function listNuxtModules(options?: {
  search?: string
  category?: string
  sort?: 'downloads' | 'stars' | 'publishedAt' | 'createdAt'
}): Promise<NuxtModule[]> {
  const result = await callNuxtTool<NuxtModule[]>('list-modules', options ?? {})
  return result ?? []
}

/**
 * Get Nuxt module details
 */
export async function getNuxtModule(slug: string): Promise<NuxtModule | null> {
  return callNuxtTool<NuxtModule>('get-module', { slug })
}

/**
 * List deploy providers
 */
export async function listDeployProviders(): Promise<Array<{ title: string, path: string }>> {
  const result = await callNuxtTool<Array<{ title: string, path: string }>>('list-deploy-providers')
  return result ?? []
}

/**
 * Get deploy provider details
 */
export async function getDeployProvider(path: string): Promise<string | null> {
  return callNuxtTool<string>('get-deploy-provider', { path })
}

/**
 * Close the MCP client connection
 */
export async function closeNuxtClient(): Promise<void> {
  if (clientInstance) {
    await clientInstance.close()
    clientInstance = null
    connectionPromise = null
  }
}
