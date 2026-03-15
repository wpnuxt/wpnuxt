/**
 * Unwrap an ACF select/radio field value that may be returned as a single-element array.
 * WPGraphQL types ACF select fields as `[String]` (array) regardless of whether
 * the field is configured for single or multiple selection.
 *
 * @param value - The field value (string, string[], null, or undefined)
 * @returns The scalar value, or undefined if empty
 *
 * @example
 * const status = computed(() => unwrapScalar(event.value?.eventDetails?.eventStatus))
 * // string[] → first element
 * // string → passthrough
 * // null/undefined → undefined
 */
function unwrapScalar<T>(value: T | T[] | null | undefined): T | undefined {
  if (value == null) return undefined
  if (Array.isArray(value)) return value[0]
  return value
}

/**
 * Unwrap a WPGraphQL connection `{ nodes: [...] }` to its first node.
 * Useful for ACF relationship/post_object fields configured as single-value,
 * which still return the full connection pattern.
 *
 * @param connection - A WPGraphQL connection object with a `nodes` array
 * @returns The first node, or undefined if empty
 *
 * @example
 * const venue = computed(() => unwrapConnection(event.value?.eventDetails?.eventVenue))
 * // { nodes: [{ title: 'Main Hall' }] } → { title: 'Main Hall' }
 * // { nodes: [] } → undefined
 * // null/undefined → undefined
 */
function unwrapConnection<T>(connection: { nodes: T[] } | null | undefined): T | undefined {
  return connection?.nodes?.[0]
}

export { unwrapScalar, unwrapConnection }
