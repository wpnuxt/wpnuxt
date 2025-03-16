import type { H3Event } from 'h3'
import { readBody } from 'h3'
import { defineCachedEventHandler } from '#imports'
import type { GraphqlResponse } from '#graphql-documents'

export default defineCachedEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  if (!body || !body.queryName) {
    throw new Error(
      'The request must contain a queryName'
    )
  }
  return $fetch('/api/graphql_middleware/' + (body.operation || 'query') + '/' + body.queryName, {
    method: body.operation === 'mutation' ? 'POST' : 'GET',
    params: body.operation === 'query' ? buildRequestParams(body.params) : undefined,
    body: body.operation === 'mutation' ? body.params : undefined,
    headers: {
      Authorization: `Bearer ${event.context.accessToken}`
    }
  }).then((v: GraphqlResponse) => {
    return {
      data: v.data,
      error: v.errors || undefined
    }
  })
}, {
  group: 'api',
  name: 'wpContent',
  getKey: async (event: H3Event) => {
    const body = await readBody(event)
    return `${body.queryName}${body.params ? '_' + JSON.stringify(body.params).replaceAll('"', '').replaceAll(':', '_') : ''}`
  },
  swr: true,
  maxAge: 60 * 5 // 5 minutes
})

/**
 * Get the parameters for the GraphQL middleware query.
 */
export function buildRequestParams(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: Record<string, any> | undefined | null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  if (!variables) {
    return {}
  }
  // Determine if each variable can safely be passed as query parameter.
  // This is only the case for strings.
  for (const key in variables) {
    if (typeof variables[key] !== 'string') {
      return {
        __variables: JSON.stringify(variables)
      }
    }
  }

  return variables
}
