import { defineGraphqlClientOptions } from 'nuxt-graphql-middleware/client-options'
import { useRoute } from '#imports'

export default defineGraphqlClientOptions<{
  preview?: string
  previewToken?: string
}>({
  buildClientContext() {
    const route = useRoute()

    return {
      preview: route.query.preview === 'true' ? 'true' : undefined,
      previewToken: route.query.token as string | undefined
    }
  }
})
