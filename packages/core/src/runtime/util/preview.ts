/**
 * Returns the database ID of the post a preview link points to, or `undefined`
 * when the query is not a preview request.
 *
 * WordPress puts `preview_id` on the preview link of a published post and
 * `p` / `page_id` on the preview link of a draft. The ID only counts together
 * with `preview=true`, so a plain `?p=123` permalink is never a preview. This
 * is the same rule `app/graphqlMiddleware.clientOptions.ts` uses to build the
 * `X-GraphQL-Preview` header.
 */
export function getPreviewId(query: Record<string, unknown>): string | undefined {
  if (query.preview !== 'true') return undefined

  const id = [query.preview_id, query.p, query.page_id].find(value => typeof value === 'string' && value !== '')
  return typeof id === 'string' && /^[1-9]\d*$/.test(id) ? id : undefined
}
