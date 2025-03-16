import { defineCachedEventHandler, useRuntimeConfig } from '#imports'

export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  return {
    wpNuxt: config.public.wpNuxt
  }
})
