import { defineCachedEventHandler } from 'nitro/runtime'
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'

export default defineCachedEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig(event)
  return {
    wpNuxt: config.public.wpNuxt
  }
})
