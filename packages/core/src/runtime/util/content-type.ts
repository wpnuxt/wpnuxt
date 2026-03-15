interface ContentNode {
  contentTypeName: string
  [key: string]: unknown
}

/**
 * Type guard to check if a content node is a Page.
 *
 * @param node - A content node returned by useNodeByUri() or similar
 * @returns `true` if the node is a Page
 *
 * @example
 * const { data } = await useNodeByUri({ uri: '/about' })
 * if (isPage(data.value)) {
 *   // data.value is narrowed to PageFragment
 *   console.log(data.value.isFrontPage)
 * }
 */
function isPage<T extends ContentNode>(node: T | null | undefined): node is T & { contentTypeName: 'page' } {
  return node?.contentTypeName === 'page'
}

/**
 * Type guard to check if a content node is a Post.
 *
 * @param node - A content node returned by useNodeByUri() or similar
 * @returns `true` if the node is a Post
 *
 * @example
 * const { data } = await useNodeByUri({ uri: '/hello-world' })
 * if (isPost(data.value)) {
 *   // data.value is narrowed to PostFragment
 *   console.log(data.value.categories)
 * }
 */
function isPost<T extends ContentNode>(node: T | null | undefined): node is T & { contentTypeName: 'post' } {
  return node?.contentTypeName === 'post'
}

/**
 * Type guard to check if a content node matches a specific content type.
 * Useful for custom post types (e.g., 'event', 'product').
 *
 * @param node - A content node
 * @param typeName - The WordPress content type name to check
 * @returns `true` if the node matches the given content type
 *
 * @example
 * const { data } = await useNodeByUri({ uri: '/my-event' })
 * if (isContentType(data.value, 'event')) {
 *   // data.value.contentTypeName is narrowed to 'event'
 * }
 */
function isContentType<T extends ContentNode, K extends string>(node: T | null | undefined, typeName: K): node is T & { contentTypeName: K } {
  return node?.contentTypeName === typeName
}

export { isPage, isPost, isContentType }
