import { createError } from 'h3'
import type { EventHandler, H3Event } from 'h3'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useRuntimeConfig: (event?: any) => any
declare const defineCachedEventHandler: (
  handler: EventHandler,
  options: { name: string, maxAge: number, swr: boolean, shouldBypassCache: (event: H3Event) => boolean }
) => EventHandler

export interface SitemapOptions {
  postTypes?: string[]
  exclude?: string[]
  taxonomies?: boolean
}

export interface SitemapNode {
  uri?: string | null
  modifiedGmt?: string | null
  featuredImage?: { node?: { sourceUrl?: string | null, altText?: string | null } | null } | null
}

export interface SitemapUrl {
  loc: string
  lastmod?: string
  images?: { loc: string, title?: string }[]
}

interface Connection {
  pageInfo: { hasNextPage: boolean, endCursor: string | null }
  nodes: SitemapNode[]
}

interface GraphqlResult {
  data?: { connection?: Connection | null }
  errors?: { message: string }[]
}

const PAGE_SIZE = 100

const CONTENT_NODES_QUERY = `query WPNuxtSitemapContentNodes($first: Int!, $after: String, $contentTypes: [ContentTypeEnum]) {
  connection: contentNodes(first: $first, after: $after, where: { contentTypes: $contentTypes }) {
    pageInfo { hasNextPage endCursor }
    nodes {
      uri
      modifiedGmt
      ... on NodeWithFeaturedImage { featuredImage { node { sourceUrl altText } } }
    }
  }
}`

const TERMS_QUERY = `query WPNuxtSitemapTerms($first: Int!, $after: String) {
  connection: terms(first: $first, after: $after, where: { hideEmpty: true }) {
    pageInfo { hasNextPage endCursor }
    nodes { uri }
  }
}`

/** Whether a URI matches one of the exclude patterns. A trailing `*` matches a prefix. */
export function isExcluded(uri: string, exclude: string[] = []): boolean {
  return exclude.some(pattern => pattern.endsWith('*') ? uri.startsWith(pattern.slice(0, -1)) : uri === pattern)
}

/** Maps WPGraphQL nodes to sitemap entries. The `uri` is kept as is: it is the WordPress permalink. */
export function toSitemapUrls(nodes: SitemapNode[], exclude: string[] = []): SitemapUrl[] {
  const urls: SitemapUrl[] = []
  for (const node of nodes) {
    if (!node.uri || isExcluded(node.uri, exclude)) continue
    const url: SitemapUrl = { loc: node.uri }
    if (node.modifiedGmt) url.lastmod = `${node.modifiedGmt}Z`
    const image = node.featuredImage?.node
    if (image?.sourceUrl) url.images = [{ loc: image.sourceUrl, ...(image.altText ? { title: image.altText } : {}) }]
    urls.push(url)
  }
  return urls
}

async function fetchAllNodes(endpoint: string, query: string, variables: Record<string, unknown>): Promise<SitemapNode[]> {
  const nodes: SitemapNode[] = []
  let after: string | null = null
  do {
    const response: Response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { ...variables, first: PAGE_SIZE, after } })
    })
    const result: GraphqlResult | undefined = response.ok ? await response.json() : undefined
    const connection = result?.data?.connection
    if (!connection) {
      throw createError({
        statusCode: 502,
        statusMessage: `WPNuxt sitemap: WordPress request failed (${result?.errors?.[0]?.message ?? response.status})`
      })
    }
    nodes.push(...connection.nodes)
    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null
  } while (after)
  return nodes
}

/** Lists the published WordPress content (and optionally the taxonomy archives) as sitemap entries. */
export async function fetchSitemapUrls(endpoint: string, options: SitemapOptions = {}): Promise<SitemapUrl[]> {
  // Left out when unset: WPGraphQL treats contentTypes: null as posts only
  const contentTypes = options.postTypes?.length ? options.postTypes.map(type => type.toUpperCase()) : undefined
  const nodes = await fetchAllNodes(endpoint, CONTENT_NODES_QUERY, { contentTypes })
  if (options.taxonomies) {
    nodes.push(...await fetchAllNodes(endpoint, TERMS_QUERY, {}))
  }
  return toSitemapUrls(nodes, options.exclude)
}

const cacheConfig = useRuntimeConfig().public.wpNuxt.cache
const maxAge: number = cacheConfig?.maxAge ?? 300

// A source for @nuxtjs/sitemap. No auth or preview header is sent, so WordPress only returns published content.
// The cache name contains 'wpnuxt', so the revalidate endpoint purges it too.
export default defineCachedEventHandler((event) => {
  const { wordpressUrl, graphqlEndpoint, sitemap } = useRuntimeConfig(event).public.wpNuxt
  return fetchSitemapUrls(`${wordpressUrl}${graphqlEndpoint}`, sitemap)
}, {
  name: 'wpnuxt-sitemap',
  maxAge,
  swr: cacheConfig?.swr ?? true,
  // Nitro never expires an entry with maxAge 0, so bypass the cache instead
  shouldBypassCache: () => cacheConfig?.enabled === false || maxAge <= 0
})
