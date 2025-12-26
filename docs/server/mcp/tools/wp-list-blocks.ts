import { z } from 'zod'
import { executeGraphQL } from '../../utils/graphql'

// Query to fetch content with raw block data
const BLOCKS_ANALYSIS_QUERY = `
  query BlocksAnalysis($first: Int = 50) {
    posts(first: $first) {
      nodes {
        content(format: RAW)
      }
    }
    pages(first: $first) {
      nodes {
        content(format: RAW)
      }
    }
  }
`

interface BlockInfo {
  name: string
  namespace: string
  blockName: string
  count: number
  hasAttributes: boolean
  sampleAttributes?: Record<string, unknown>
}

// Extract blocks from raw WordPress content
function extractBlocksFromContent(rawContent: string | null | undefined): Array<{
  fullName: string
  namespace: string
  blockName: string
  attributes?: Record<string, unknown>
}> {
  if (!rawContent) return []

  const blockRegex = /<!-- wp:([a-z0-9-]+\/)?([a-z0-9-]+)(?:\s+(\{[^}]*\}))?\s*\/?-->/g
  const blocks: Array<{
    fullName: string
    namespace: string
    blockName: string
    attributes?: Record<string, unknown>
  }> = []
  let match

  while ((match = blockRegex.exec(rawContent)) !== null) {
    const namespace = match[1] ? match[1].slice(0, -1) : 'core'
    const blockName = match[2]
    const attributesJson = match[3]

    let attributes: Record<string, unknown> | undefined
    if (attributesJson) {
      try {
        attributes = JSON.parse(attributesJson)
      } catch {
        // Invalid JSON, skip attributes
      }
    }

    blocks.push({
      fullName: `${namespace}/${blockName}`,
      namespace,
      blockName,
      attributes
    })
  }

  return blocks
}

export default defineMcpTool({
  description: 'Detect and analyze Gutenberg blocks in use across the WordPress site. Scans posts and pages to identify which blocks are used, their frequency, and sample attributes.',
  inputSchema: {
    sampleSize: z.number().min(10).max(100).optional().describe('Number of posts/pages to scan (10-100, default 50)')
  },
  async handler({ sampleSize = 50 }) {
    const result = await executeGraphQL<{
      posts: { nodes: Array<{ content?: string }> }
      pages: { nodes: Array<{ content?: string }> }
    }>(BLOCKS_ANALYSIS_QUERY, { first: sampleSize })

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    // Combine all content
    const allContent = [
      ...(result.data?.posts.nodes || []),
      ...(result.data?.pages.nodes || [])
    ]

    // Extract and analyze blocks
    const blockMap = new Map<string, BlockInfo>()

    allContent.forEach((item) => {
      const blocks = extractBlocksFromContent(item.content)

      blocks.forEach((block) => {
        const existing = blockMap.get(block.fullName)
        if (existing) {
          existing.count++
          // Keep first sample attributes
        } else {
          blockMap.set(block.fullName, {
            name: block.fullName,
            namespace: block.namespace,
            blockName: block.blockName,
            count: 1,
            hasAttributes: !!block.attributes,
            sampleAttributes: block.attributes
          })
        }
      })
    })

    // Convert to sorted array
    const blocks = Array.from(blockMap.values())
      .sort((a, b) => b.count - a.count)

    // Group by namespace
    const byNamespace: Record<string, BlockInfo[]> = {}
    blocks.forEach((block) => {
      if (!byNamespace[block.namespace]) {
        byNamespace[block.namespace] = []
      }
      byNamespace[block.namespace].push(block)
    })

    // Identify core vs custom blocks
    const coreBlocks = blocks.filter(b => b.namespace === 'core')
    const customBlocks = blocks.filter(b => b.namespace !== 'core')

    return jsonResult({
      summary: {
        totalUniqueBlocks: blocks.length,
        totalBlockInstances: blocks.reduce((sum, b) => sum + b.count, 0),
        contentScanned: {
          posts: result.data?.posts.nodes.length ?? 0,
          pages: result.data?.pages.nodes.length ?? 0
        },
        coreBlocksUsed: coreBlocks.length,
        customBlocksUsed: customBlocks.length,
        namespaces: Object.keys(byNamespace)
      },
      blocks: blocks.map(b => ({
        name: b.name,
        namespace: b.namespace,
        blockName: b.blockName,
        count: b.count,
        hasAttributes: b.hasAttributes,
        sampleAttributes: b.sampleAttributes
      })),
      byNamespace: Object.fromEntries(
        Object.entries(byNamespace).map(([ns, nsBlocks]) => [
          ns,
          nsBlocks.map(b => ({ name: b.blockName, count: b.count }))
        ])
      )
    })
  }
})
