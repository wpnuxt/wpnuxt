import { z } from 'zod'
import { executeGraphQL, SAMPLE_CONTENT_QUERY } from '../../utils/graphql'

// Helper to extract Gutenberg blocks from raw content
function extractBlocks(rawContent: string | null | undefined): Array<{ name: string, attributes?: Record<string, unknown> }> {
  if (!rawContent) return []

  const blockRegex = /<!-- wp:([a-z0-9-]+\/)?([a-z0-9-]+)(?:\s+(\{[^}]*\}))?\s*\/?-->/g
  const blocks: Array<{ name: string, attributes?: Record<string, unknown> }> = []
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
      name: `${namespace}/${blockName}`,
      attributes
    })
  }

  return blocks
}

export default defineMcpTool({
  description: 'Fetch sample content from WordPress to understand data shapes and detect Gutenberg blocks in use. Useful for generating components that match actual content structure.',
  inputSchema: {
    contentType: z.enum(['POST', 'PAGE']).describe('The content type to sample (POST or PAGE)'),
    limit: z.number().min(1).max(20).optional().describe('Number of items to sample (1-20, default 5)')
  },
  async handler({ contentType, limit = 5 }) {
    const result = await executeGraphQL<{
      contentNodes: {
        nodes: Array<{
          title?: string
          id: string
          databaseId: number
          uri: string
          contentTypeName: string
          date: string
          content?: string
          featuredImage?: {
            node: {
              sourceUrl: string
              altText: string
              mediaDetails: {
                width: number
                height: number
              }
            }
          }
        }>
      }
    }>(SAMPLE_CONTENT_QUERY, { contentType, first: limit })

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const nodes = result.data?.contentNodes.nodes ?? []

    // Analyze blocks across all sampled content
    const blockUsage: Record<string, number> = {}
    const samples = nodes.map((node) => {
      const blocks = extractBlocks(node.content)

      // Count block usage
      blocks.forEach((block) => {
        blockUsage[block.name] = (blockUsage[block.name] || 0) + 1
      })

      return {
        id: node.id,
        databaseId: node.databaseId,
        title: node.title,
        uri: node.uri,
        date: node.date,
        hasFeaturedImage: !!node.featuredImage,
        featuredImageSize: node.featuredImage
          ? {
              width: node.featuredImage.node.mediaDetails.width,
              height: node.featuredImage.node.mediaDetails.height
            }
          : null,
        blockCount: blocks.length,
        blocksUsed: [...new Set(blocks.map(b => b.name))]
      }
    })

    // Sort blocks by usage
    const sortedBlocks = Object.entries(blockUsage)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }))

    return jsonResult({
      contentType,
      sampleCount: samples.length,
      samples,
      blockAnalysis: {
        uniqueBlocks: sortedBlocks.length,
        totalBlockInstances: Object.values(blockUsage).reduce((a, b) => a + b, 0),
        blocks: sortedBlocks
      }
    })
  }
})
