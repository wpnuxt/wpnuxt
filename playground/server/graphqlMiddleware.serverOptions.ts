import { defineGraphqlServerOptions } from 'nuxt-graphql-middleware/dist/runtime/serverOptions'
import { getHeader } from 'h3'
import type { H3Event } from 'h3'

export default defineGraphqlServerOptions({

  serverFetchOptions(event: H3Event) {
    return {
      headers: {
        Authorization: getHeader(event, 'Authorization')
      }
    }
  }
})
